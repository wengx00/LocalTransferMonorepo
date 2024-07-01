import { Socket } from 'net';
import { Readable } from 'stream';

/**
 * 协议状态
 */
export enum ProtocolStatus {
  NOT_START,
  HEADER_PENDING,
  BODY_PENDING,
  DONE,
}

/**
 * 协议错误
 */
export class ProtocolException extends Error {
  constructor(
    public readonly type: 'send' | 'receive',
    public readonly status: ProtocolStatus,
    public readonly originErr?: any,
  ) {
    super(
      `Error on Protocol, type: ${type}, status: ${status}, error: ${originErr}`,
    );
  }
}

/** 接收处理器参数 */
export type HandlerContext = {
  status: ProtocolStatus;
  buffer: Buffer;
  total: number;
  error?: ProtocolException;
};
/** 接收处理器 */
export type Handler = Set<(context: HandlerContext) => any>;

/** 发送/接收回调选项 */
export interface ProtocolCallbackOptions {
  onProgress?: (percent: number, speed: number) => any;
  onDone?: () => any;
  onError?: (err: ProtocolException) => any;
}

/**
 * 基于 TCP 封装的自定义应用层协议
 * * 在 TCP 包头中增加4字节记录Body的Header，防止粘包
 * * 使用异步事件驱动，开箱即用
 */
export class Protocol {
  // 接收状态 -> 默认未开始
  private receiveStatus: ProtocolStatus = ProtocolStatus.NOT_START;

  // 发送状态 -> 默认未开始
  private sendStatus: ProtocolStatus = ProtocolStatus.NOT_START;

  // 接收处理器
  private hander: Handler = new Set();

  /**
   * Socket 绑定接收代理
   */
  private bindSocket() {
    let pendingLength = 0;
    let pendingBuffer = Buffer.alloc(0);
    let totalLength = 0;
    this.socket.on('data', (chunk) => {
      let buffer = chunk;
      while (buffer.length) {
        if (this.receiveStatus === ProtocolStatus.NOT_START) {
          this.receiveStatus = ProtocolStatus.HEADER_PENDING;
          pendingLength = totalLength = buffer.readUInt32BE(0);
          pendingBuffer = Buffer.alloc(0);
          buffer = buffer.subarray(4);
          this.receiveStatus = ProtocolStatus.BODY_PENDING;
          continue;
        }
        // 读取数据到pendingBuffer，长度不超过header指定的长度
        pendingBuffer = buffer.subarray(
          0,
          Math.min(buffer.length, pendingLength),
        );
        if (pendingLength >= buffer.length) {
          // 读取长度不小于本次接收buffer的长度
          pendingLength -= buffer.length;
          if (pendingLength === 0) {
            // 读完了完整的包
            this.receiveStatus = ProtocolStatus.DONE;
          }
          buffer = Buffer.alloc(0);
        } else {
          // 不止一个完整的包
          this.receiveStatus = ProtocolStatus.DONE;
          buffer = buffer.subarray(pendingLength);
          pendingLength = 0;
        }
        this.hander.forEach((fn) =>
          fn({
            status: this.receiveStatus,
            buffer: pendingBuffer,
            total: totalLength,
          }),
        );
        if (pendingLength === 0) {
          this.receiveStatus = ProtocolStatus.NOT_START;
          totalLength = 0;
        }
        pendingBuffer = Buffer.alloc(0);
      }
    });
  }

  /**
   * 构造方法
   * @param socket TCP Socket
   */
  constructor(private readonly socket: Socket) {
    this.bindSocket();
  }

  /**
   * 流式发送
   * @param stream 可读流
   * @param length 流长度
   * @param options 发送回调选项
   */
  sendStream(
    stream: Readable,
    length: number,
    options?: ProtocolCallbackOptions,
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        const { onProgress, onDone, onError } = options || {};

        // Update Status
        this.sendStatus = ProtocolStatus.HEADER_PENDING;
        const header = Buffer.alloc(4);
        header.writeUInt32BE(length, 0);
        this.socket.write(header);

        // Update Status
        this.sendStatus = ProtocolStatus.BODY_PENDING;
        let sentBytes = 0;
        let lastSentTime = +new Date();
        let lastSentBytes = 0;
        const resume = () => stream.resume();

        this.socket.addListener('drain', resume);

        stream.on('end', () => {
          this.socket.removeListener('drain', resume);
          if (sentBytes !== length) {
            const error = new ProtocolException(
              'send',
              this.sendStatus,
              new Error(
                `Stream got EOF unexpected, sent: ${sentBytes}, length: ${length}`,
              ),
            );
            onError?.(error);
            reject(error);
            this.sendStatus = ProtocolStatus.NOT_START;
            return;
          }
          this.sendStatus = ProtocolStatus.DONE;
          onDone?.();
          resolve();
        });

        stream.on('data', (chunk) => {
          if (!this.socket.write(chunk)) {
            // TCP Socket 没有完全写入 chunk，暂停读取，等待 Socket 恢复再继续读
            stream.pause();
          }
          const chunkLength: number = chunk.length;
          const curTime = +new Date();
          const percent = Number(
            (((sentBytes + chunkLength) / length) * 100).toFixed(2),
          );
          // 距离上次发送的时间差
          const timeGap = curTime - lastSentTime;
          lastSentBytes += chunkLength;
          if (timeGap >= 1000) {
            // 不小于 1s，回调一次 onProgress
            onProgress?.(
              percent,
              Number((lastSentBytes / timeGap / 1000).toFixed(2)),
            );
            // 回调后重置上次发送的数据
            lastSentBytes = 0;
            lastSentTime = curTime;
          }
          // 更新累积发送长度
          sentBytes += chunkLength;
        });
      } catch (err) {
        this.sendStatus = ProtocolStatus.NOT_START;
        reject(new ProtocolException('send', this.sendStatus, err));
      }
    });
  }

  /**
   *
   * @param data 发送的字节/字符串数据
   * @param options 发送回调选项
   */
  sendBytes(data: Buffer | string, options?: ProtocolCallbackOptions) {
    const buffer = data instanceof Buffer ? data : Buffer.from(data);
    const stream = Readable.from(buffer);
    return this.sendStream(stream, buffer.length, options);
  }

  /**
   * 添加接收处理器
   * @param handler 接收处理器
   */
  addHandler(handler: (context: HandlerContext) => any) {
    this.hander.add(handler);
  }

  /**
   * 移除接收处理器
   * @param handler 接收处理器
   */
  removeHandler(handler: (context: HandlerContext) => any) {
    this.hander.delete(handler);
  }
}

import {
  RemoteInfo,
  Socket as UdpSocket,
  createSocket as createUdpSocket,
} from 'dgram';
import {
  WriteStream,
  createReadStream,
  createWriteStream,
  existsSync,
} from 'fs';
import { stat } from 'fs/promises';
import {
  Server as TcpServer,
  createConnection,
  createServer as createTcpServer,
} from 'net';
import { resolve } from 'path';

import * as ip from 'ip';
import { nanoid } from 'nanoid';

import { HandlerContext, Protocol, ProtocolStatus } from './protocol';
import errcode from '../utils/errcode';
import JsonResponse from '../utils/json-response';
import { FileInfo } from '../utils/type';
import UdpMessage from '../utils/udp-message';

// Service初始化选项
export interface ServiceInitOptions {
  // 下载根目录
  downloadRoot: string;
}

// 服务信息
export interface ServiceInfo {
  // 目标设备IP
  ip: string;
  // 目标 Service TCP 端口
  port: number;
  // 目标 Service ID
  id: string;
  // 目标 Service 名称
  name: string;
}

// 发送文件请求
export interface SendFileRequest {
  // 本地文件路径
  path: string;
  // 目标设备ID
  targetId: string;
  // 传输任务创建成功回调
  onLaunch?: (context: FileInfo) => any;
  // 传输进度回调
  onProgress?: (
    context: FileInfo & {
      // 当前传输进度 (0-100)%
      progress: number;
      // 实时速率 KB/s
      speed: number;
    },
  ) => any;
}

// 发送文件Resolve时返回的结果
export interface SendFileResult extends FileInfo {
  // 总耗时
  cost: number;
}

// 发送文件Reject时抛出的错误
export interface SendFileException extends FileInfo {
  // 失败原因
  reason: string;
}

// 接收文件监听器
export type ReceiveHandler = (
  context: FileInfo & {
    // 当前传输进度 (0-100)%
    progress: number;
    // 实时速率 KB/s
    speed: number;
    // 是否已结束
    done: boolean;
  },
  err?: JsonResponse,
) => any;

export interface IService {
  getId(): string;

  getName(): string;
  setName(name: string): void;

  setTcpPort(port: number): void;
  setDownloadRoot(downloadRoot: string): void;

  // 刷新可用设备列表
  refresh(): void;
  // 获取可用设备列表
  getAvailableServices(): ServiceInfo[];
  // 获取受信设备列表
  getVerifiedDevices(): ServiceInfo[];
  // 添加受信设备
  addVerifiedDevice(id: string): ServiceInfo[];
  // 删除受信设备
  removeVerifiedDevice(id: string): ServiceInfo[];
  // 清空受信列表
  clearVerifiedDevices(): ServiceInfo[];
  // 指定目标发送文件
  sendFile(request: SendFileRequest): Promise<SendFileResult>;
  // 注册接收文件监听器
  addReceiveHandler(handler: ReceiveHandler): void;
  // 删除接收文件监听器
  removeReceiveHandler(handler: ReceiveHandler): void;
}

/**
 * 服务选项
 */
export interface ServiceOptions {
  // 下载的根目录
  downloadRoot: string;
  // TCP端口，默认30
  tcpPort?: number;
}

export class Service implements IService {
  constructor({ downloadRoot }: ServiceOptions) {
    this.downloadRoot = downloadRoot;
    this.initServiceInfo();
    this.initTcpServer();
    this.initUdpSocket();
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  setTcpPort(port: number): void {
    this.tcpServer?.close();
    this.tcpPort = port;
    this.initTcpServer();
  }

  setDownloadRoot(downloadRoot: string): void {
    this.downloadRoot = downloadRoot;
  }

  addReceiveHandler(handler: ReceiveHandler): void {
    this.receiveHandlers.add(handler);
  }

  removeReceiveHandler(handler: ReceiveHandler): void {
    this.receiveHandlers.delete(handler);
  }

  getAvailableServices(): ServiceInfo[] {
    return [...this.availableServices];
  }

  getVerifiedDevices(): ServiceInfo[] {
    return [...this.verifiedServices];
  }

  removeVerifiedDevice(targetId: string): ServiceInfo[] {
    this.verifiedServices = this.verifiedServices.filter(
      ({ id }) => id !== targetId,
    );
    return [...this.verifiedServices];
  }

  addVerifiedDevice(id: string): ServiceInfo[] {
    const target = this.verifiedServices.find(
      ({ id: targetId }) => id === targetId,
    );
    if (!target) {
      return [...this.verifiedServices];
    }
    if (!this.verifiedServices.find(({ id: targetId }) => id === targetId)) {
      this.verifiedServices.push({
        ...target,
      });
    }
    return [...this.verifiedServices];
  }

  clearVerifiedDevices(): ServiceInfo[] {
    this.verifiedServices = [];
    return [...this.verifiedServices];
  }

  sendFile(request: SendFileRequest): Promise<SendFileResult> {
    // 区分 Windows 和 Unix 下的路径分隔符
    const divider = process.platform === 'win32' ? '\\' : '/';
    const { path, targetId, onLaunch, onProgress } = request;
    return new Promise((resolve, reject) => {
      if (!path || !targetId) {
        reject(JsonResponse.fail(errcode.BAD_REQUEST, '参数错误'));
        return;
      }
      if (!existsSync(path)) {
        reject(JsonResponse.fail(errcode.NOT_FOUND, '目标文件不存在'));
        return;
      }
      const batchId = nanoid(12);
      const target = this.availableServices.find(({ id }) => id === targetId);

      if (!target) {
        reject(JsonResponse.fail(errcode.NOT_FOUND, '目标设备不存在'));
        return;
      }

      const { ip: host, port } = target;

      stat(path).then(({ size, isFile }) => {
        if (!isFile()) {
          reject(JsonResponse.fail(errcode.BAD_REQUEST, '目标路径不是文件'));
          return;
        }
        // 先发送 FileInfo
        const fileInfo: FileInfo = {
          filename: path.split(divider).pop()!,
          size,
          batchId,
        };

        const socket = createConnection({
          port,
          host,
        });

        const proxy = new Protocol(socket);
        let chunk: Buffer = Buffer.alloc(0);
        let verified = false;
        let socketError = false;

        const proxyHandler = async ({
          buffer,
          error,
          status,
        }: HandlerContext) => {
          if (verified) {
            return;
          }
          // 需要接受一次合法性检验才能开始发送
          verified = true;
          if (error) {
            reject(
              JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, error.message),
            );
            socket.end();
            return;
          }
          if (status !== ProtocolStatus.DONE) {
            chunk = Buffer.concat([chunk, buffer]);
            return;
          }
          const { retcode, errMsg } = JSON.parse(
            chunk.toString('utf-8'),
          ) as JsonResponse;

          if (retcode !== 0) {
            reject(JsonResponse.fail(retcode, errMsg));
            socket.end();
          }
          chunk = Buffer.alloc(0);

          // 验证通过，开始发送流程
          const startTime = +new Date();

          onLaunch?.(fileInfo);

          await proxy.sendBytes(JSON.stringify(fileInfo));
          if (socketError) {
            // 假如在事件循环中出现了 Socket 错误，直接结束流程
            return;
          }
          const readStream = createReadStream(path);
          proxy.sendStream(readStream, size, {
            onDone() {
              resolve({
                ...fileInfo,
                cost: (+new Date() - startTime) / 1000,
              });
            },
            onError(err) {
              reject(
                JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, err.message),
              );
            },
            onProgress(percent, speed) {
              onProgress?.({
                ...fileInfo,
                progress: percent,
                speed,
              });
            },
          });
        };

        proxy.addHandler(proxyHandler);

        socket.on('end', () => proxy.removeHandler(proxyHandler));

        socket.on('error', () => {
          socketError = true;
          proxy.removeHandler(proxyHandler);
          reject(JsonResponse.fail(errcode.SOCKET_ERROR, 'socket error'));
        });
      });
    });
  }

  refresh(): void {
    this.udpSocket.send(
      JsonResponse.ok({
        type: UdpMessage.SEARCH_FOR_AVAILABLE_SERVICE,
        info: {
          id: this.id,
          name: this.name,
          ip: ip.address('public', 'ipv4'),
        },
      }).toJSON(),
      86,
      '255.255.255.255', // 广播
    );
  }

  // 下载根目录
  private downloadRoot: string;

  // Service ID
  private id!: string;

  // Service name
  private name!: string;

  // TCP 端口
  private tcpPort!: number;

  // TCP 服务器
  private tcpServer!: TcpServer;

  // UDP Socket
  private udpSocket!: UdpSocket;

  // 可用 Service 列表
  private availableServices!: ServiceInfo[];

  // 受信 Service 列表
  private verifiedServices!: ServiceInfo[];

  // 接收处理器
  private receiveHandlers!: Set<ReceiveHandler>;

  // 初始化 Service 信息
  private initServiceInfo() {
    // 8 位 nanoid，为了达到至少一次碰撞的 1% 概率，需要约 99 天或 200 万个 ID
    this.id = nanoid(8);
    // 初始化名称为空字符串
    this.name = '';
    // 初始化 TCP 端口为 86（作为 LocalTransfer 熟知端口）
    this.tcpPort = 86;
    this.availableServices = [];
    this.verifiedServices = [];
    this.receiveHandlers = new Set();
  }

  // 初始化 TCP 服务器
  private initTcpServer() {
    this.tcpServer = createTcpServer(async (socket) => {
      const remote = {
        address: socket.remoteAddress!,
        port: socket.remotePort,
        family: socket.remoteFamily,
      };
      if (remote.family?.toLowerCase() === 'ipv6') {
        const ipSeq = remote.address.split(':');
        remote.address = ipSeq[ipSeq.length - 1];
      }
      const proxy = new Protocol(socket);
      if (!this.verifiedServices.find(({ ip }) => ip === remote.address)) {
        proxy
          .sendBytes(
            JsonResponse.fail(errcode.UNAUTHORIZED, '未受信的设备').toJSON(),
          )
          .finally(() => {
            socket.end();
          });
        return;
      }

      // 发送校验成功回包
      await proxy.sendBytes(JsonResponse.ok().toJSON());

      let fileInfo: FileInfo | null = null;
      // 上一次至今接收的字节数
      let lastReceivedBytes = 0;
      // 共接收字节数
      let receivedBytes = 0;
      // 上一次时间戳
      let lastReceivedTime = 0;
      // 不是流式接收时需要拼接完整buffer
      let chunk = Buffer.alloc(0);
      // 写入流
      let writeStream: WriteStream | null = null;
      // 写入路径
      let writePath: string = '';
      // 接收批次ID
      let batchId: string = '';

      const receiveHandler = (context: HandlerContext) => {
        const { error, buffer, status, total } = context;

        if (error) {
          this.receiveHandlers.forEach((handler) => {
            handler(
              {} as any,
              JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, error.message),
            );
          });
          fileInfo = null;
          return;
        }

        if (!fileInfo) {
          if (status !== ProtocolStatus.DONE) {
            // 接收FileInfo时不是流，需要完整接收JSON
            chunk = Buffer.concat([chunk, buffer]);
            return;
          }
          try {
            fileInfo = JSON.parse(chunk.toString('utf-8'));
          } catch (err) {
            // 忽略无法解析的JSON
            fileInfo = null;
            return;
          } finally {
            chunk = Buffer.alloc(0);
          }
        }
        if (!writePath) {
          // batchId和时间戳附加到原始文件名
          writePath = resolve(
            this.downloadRoot,
            `${fileInfo!.batchId}-${+new Date()}-${fileInfo!.filename}`,
          );
        }
        if (!writeStream) {
          writeStream = createWriteStream(writePath);
        }

        writeStream.write(buffer);

        const done = status === ProtocolStatus.DONE;

        const currentTime = +new Date();
        if (lastReceivedTime === 0) {
          lastReceivedTime = currentTime;
        }
        const gap = currentTime - lastReceivedTime;

        lastReceivedBytes += buffer.length;
        receivedBytes += buffer.length;

        if (gap >= 1000 || done) {
          // 超过1s或已结束，回调onProgress
          const progress = Number(((receivedBytes / total) * 100).toFixed(2));
          const speed = Number((lastReceivedBytes / 1000 / gap).toFixed(2));
          this.receiveHandlers.forEach((handler) => {
            handler({
              ...fileInfo!,
              batchId,
              progress,
              speed,
              done,
            });
          });

          lastReceivedBytes = 0;
        }

        if (done) {
          // 已经写入了最后一个buffer
          writeStream.close();
          // 重置状态
          writeStream = null;
          fileInfo = null;
          writePath = '';
          batchId = '';
          lastReceivedTime = 0;
          receivedBytes = 0;
        }
      };

      proxy.addHandler(receiveHandler);

      socket.on('end', () => {
        proxy.removeHandler(receiveHandler);
      });

      socket.on('error', () => {
        proxy.removeHandler(receiveHandler);
        if (batchId) {
          this.receiveHandlers.forEach((handler) => {
            handler(
              {} as any,
              JsonResponse.fail(errcode.SOCKET_ERROR, 'Socket 连接错误'),
            );
          });
          writeStream?.close();
          writeStream = null;
          fileInfo = null;
          writePath = '';
          batchId = '';
          lastReceivedTime = 0;
          receivedBytes = 0;
        }
      });
    });

    this.tcpServer.listen(this.tcpPort, () => {
      console.log(`TCP Server listening on ${ip.address()}:${this.tcpPort}`);
    });
  }

  // 初始化 UDP Socket
  private initUdpSocket() {
    const udpHandler = (buffer: Buffer, rinfo: RemoteInfo) => {
      // 忽略本机 IP 的发包
      const localIp = ip.address('public', 'ipv4');
      if (localIp === rinfo.address) {
        return;
      }

      try {
        // 解析JSON失败会被捕获
        const message: JsonResponse = JSON.parse(buffer.toString('utf-8'));
        const { retcode, data, errMsg } = message;
        const { type, info } = data as {
          type?: UdpMessage;
          info?: ServiceInfo;
        };

        if (retcode !== 0 || errMsg) {
          // 有错误的回包直接丢弃
          return;
        }

        switch (type) {
          case UdpMessage.SEARCH_FOR_AVAILABLE_SERVICE:
            // 有 Service 在寻找其他可用 Service，回包
            this.udpSocket.send(
              JsonResponse.ok({
                type: UdpMessage.TELL_AVAILABLE_SERVICE,
                info: {
                  id: this.id,
                  name: this.name,
                  ip: localIp,
                  port: this.tcpPort,
                },
              }).toJSON(),
            );
            if (info) {
              // 将该 Service 作为可用来源
              const target = this.availableServices.find(
                ({ id }) => id === info.id,
              );
              if (!target) {
                this.availableServices.push(info);
              }
            }
            break;
          case UdpMessage.SERVICE_DEAD:
            // 远程服务挂了，把他的可用记录删了
            this.availableServices = this.availableServices.filter(
              ({ ip }) => ip !== rinfo.address,
            );
            this.verifiedServices = this.verifiedServices.filter(
              ({ ip }) => ip !== rinfo.address,
            );
            break;
          case UdpMessage.TELL_AVAILABLE_SERVICE:
            // 有新的可用 Service，添加可用记录
            if (!info) {
              // 无效包，丢弃
              break;
            }
            // eslint-disable-next-line no-case-declarations
            const target = this.availableServices.find(
              ({ id }) => id === info.id,
            );
            if (!target) {
              this.availableServices.push(info);
            } else {
              // 使用引用更新一波已有的记录
              target.ip = info.ip;
              target.port = info.port;
              target.name = info.name;
            }
            break;
          default:
        }
      } catch (err) {
        console.log(
          `[${new Date().toLocaleTimeString()}] Udp Socket parse data failed, Remote IP: ${rinfo.address}`,
          err,
        );
      }
    };

    this.udpSocket = createUdpSocket('udp4', udpHandler.bind(this));
    // UDP 只能使用熟知端口 86
    this.udpSocket.bind(86, () => {
      console.log(`UDP Server listening on ${ip.address()}:86`);
      // 开启广播收发能力
      this.udpSocket.setBroadcast(true);
    });
  }
}

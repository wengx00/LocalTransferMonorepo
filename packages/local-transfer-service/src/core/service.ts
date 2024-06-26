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
import {
  ReceiveFileHandler,
  ReceiveTextHandler,
  AvailableServiceUpdateHandler,
  SendFileRequest,
  SendFileResult,
  SendTextRequest,
  SendTextResult,
  ServiceInfo,
  TransferInfo,
  TransferType,
} from '../utils/type';
import UdpMessage from '../utils/udp-message';

export interface IService {
  getId(): string;

  getName(): string;

  setName(name: string): void;

  setTcpPort(port: number): void;

  getTcpPort(): number;

  setDownloadRoot(downloadRoot: string): void;

  getDownloadRoot(): string;

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
  addReceiveFileHandler(handler: ReceiveFileHandler): void;
  // 注册接收文本监听器
  addReceiveTextHandler(handler: ReceiveTextHandler): void;
  // 删除接收文件监听器
  removeFileReceiveHandler(handler: ReceiveFileHandler): void;
  // 删除接收文本监听器
  removeReceiveTextHandler(handler: ReceiveTextHandler): void;
  // 发送文本
  sendText(request: SendTextRequest): Promise<SendTextResult>;
  // 注册可用服务更新监听器
  addAvailableServicesUpdateHandler(
    handler: AvailableServiceUpdateHandler,
  ): void;
  // 删除可用服务更新监听器
  removeAvailableServicesUpdateHandler(
    handler: AvailableServiceUpdateHandler,
  ): void;
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
    this.initUdpSocket().then(() => {
      // 启动服务时刷新一次可用列表
      this.refresh();
    });
  }

  addAvailableServicesUpdateHandler(
    handler: AvailableServiceUpdateHandler,
  ): void {
    this.availableServicesUpdateHandlers.add(handler);
  }

  removeAvailableServicesUpdateHandler(
    handler: AvailableServiceUpdateHandler,
  ): void {
    this.availableServicesUpdateHandlers.delete(handler);
  }

  removeReceiveTextHandler(handler: ReceiveTextHandler): void {
    this.receiveTextHandlers.delete(handler);
  }

  addReceiveTextHandler(handler: ReceiveTextHandler): void {
    this.receiveTextHandlers.add(handler);
  }

  sendText(request: SendTextRequest): Promise<SendTextResult> {
    const { text, targetId } = request;
    return new Promise((resolve, reject) => {
      if (!text || !targetId) {
        reject(JsonResponse.fail(errcode.BAD_REQUEST, '参数错误'));
        return;
      }

      const target = this.availableServices.find(({ id }) => id === targetId);

      if (!target) {
        reject(JsonResponse.fail(errcode.NOT_FOUND, '目标设备不存在'));
        return;
      }

      const { ip: host, port } = target;
      const batchId = nanoid(12);
      const transferInfo: TransferInfo = {
        filename: '',
        size: text.length,
        batchId,
        type: TransferType.TEXT,
        sourceId: this.id,
      };

      const socket = createConnection({
        port,
        host,
      });

      const proxy = new Protocol(socket);
      let chunk: Buffer = Buffer.alloc(0);
      let done = false;
      let socketError = false;

      const proxyHandler = async ({
        buffer,
        error,
        status,
        total,
      }: HandlerContext) => {
        if (done) {
          return;
        }

        if (error) {
          reject(JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, error.message));
          socket.end();
          return;
        }

        chunk = Buffer.concat([chunk, buffer]);
        if (status !== ProtocolStatus.DONE) {
          if (process.env.RUNTIME === 'e2e') {
            console.log(
              '接收 TransferInfo 片段: ',
              buffer.length,
              '总长度: ',
              total,
            );
          }
          return;
        }

        try {
          const { retcode, errMsg } = JSON.parse(
            chunk.toString('utf-8'),
          ) as JsonResponse;

          if (retcode !== 0) {
            reject(JsonResponse.fail(retcode, errMsg));
            socket.end();
            return;
          }
        } catch (err) {
          console.log('发送文本时回包解析错误', err);
          reject(JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, String(err)));
          socket.end();
          return;
        } finally {
          chunk = Buffer.alloc(0);
        }

        // 开始发送数据
        if (socketError) {
          return;
        }

        try {
          await proxy.sendBytes(text);
        } catch (err) {
          console.log('发送文本时发送数据错误', err);
          reject(JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, String(err)));
          return;
        } finally {
          done = true;
          socket.end();
        }
        if (socketError) {
          return;
        }

        // 完成传输
        resolve(transferInfo);
      };

      proxy.addHandler(proxyHandler);

      socket.on('end', () => proxy.removeHandler(proxyHandler));

      socket.on('error', (err) => {
        socketError = true;
        console.log('发送文本时 socket 错误', err);
        proxy.removeHandler(proxyHandler);
        reject(JsonResponse.fail(errcode.SOCKET_ERROR, 'socket error'));
      });

      socket.on('connect', () => {
        if (process.env.RUNTIME === 'e2e') {
          console.log('TCP Socket 已建立... 发送 TransferInfo', transferInfo);
        }
        proxy.sendBytes(JSON.stringify(transferInfo));
      });
    });
  }

  getTcpPort(): number {
    return this.tcpPort;
  }

  getDownloadRoot(): string {
    return this.downloadRoot;
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

  addReceiveFileHandler(handler: ReceiveFileHandler): void {
    this.receiveFileHandlers.add(handler);
  }

  removeFileReceiveHandler(handler: ReceiveFileHandler): void {
    this.receiveFileHandlers.delete(handler);
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
    const target = this.availableServices.find(
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

      stat(path).then(async (res) => {
        const { size } = res;
        if (!res.isFile()) {
          reject(JsonResponse.fail(errcode.BAD_REQUEST, '目标路径不是文件'));
          return;
        }
        // 先发送 TransferInfo
        const transferInfo: TransferInfo = {
          batchId,
          filename: path.split(divider).pop()!,
          size: res.size,
          type: TransferType.FILE,
          sourceId: this.id,
        };

        console.log('TransferInfo: ', transferInfo);
        console.log('Target address: ', host, port);

        const socket = createConnection({
          port,
          host,
        });

        const proxy = new Protocol(socket);
        let chunk: Buffer = Buffer.alloc(0);
        let socketError = false;
        let done = false;

        const proxyHandler = async ({
          buffer,
          error,
          status,
          total,
        }: HandlerContext) => {
          // 需要接受一次合法性检验才能开始发送
          if (done) {
            if (process.env.RUNTIME === 'e2e') {
              console.log('接收已结束但仍接收到发包');
            }
            return;
          }
          if (error) {
            console.log('接收到错误', error);
            reject(
              JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, error.message),
            );
            socket.end();
            return;
          }
          chunk = Buffer.concat([chunk, buffer]);
          if (status !== ProtocolStatus.DONE) {
            if (process.env.RUNTIME === 'e2e') {
              console.log(
                '接收 TransferInfo 片段',
                buffer.length,
                '总长度: ',
                total,
              );
            }
            return;
          }

          try {
            const { retcode, errMsg } = JSON.parse(
              chunk.toString('utf-8'),
            ) as JsonResponse;
            if (retcode !== 0) {
              if (process.env.RUNTIME === 'e2e') {
                console.log('目标设备不信任本机', retcode, errMsg);
              }
              reject(JsonResponse.fail(retcode, errMsg));
              socket.end();
              return;
            }
          } catch (err) {
            console.log('解析信任授权回包时出错', err);
            reject(JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, String(err)));
            done = true;
            socket.end();
            return;
          } finally {
            chunk = Buffer.alloc(0);
          }

          console.log('合法性检查通过');
          // 验证通过，开始发送流程
          const startTime = +new Date();

          onLaunch?.(transferInfo);

          if (socketError) {
            // 假如在事件循环中出现了 Socket 错误，直接结束流程
            return;
          }
          const readStream = createReadStream(path);
          try {
            await proxy.sendStream(readStream, size, {
              onDone() {
                resolve({
                  ...transferInfo,
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
                  ...transferInfo,
                  progress: percent,
                  speed,
                });
              },
            });
          } catch (err) {
            console.log('发送文件时出错', err);
          } finally {
            done = true;
            socket.end();
          }
        };

        proxy.addHandler(proxyHandler);

        socket.on('end', () => proxy.removeHandler(proxyHandler));

        socket.on('error', (err) => {
          console.log('socket error', err);
          socketError = true;
          proxy.removeHandler(proxyHandler);
          reject(JsonResponse.fail(errcode.SOCKET_ERROR, 'socket error'));
        });

        socket.on('connect', () => {
          if (process.env.RUNTIME === 'e2e') {
            console.log('TCP Socket 已建立... 发送 TransferInfo', transferInfo);
          }
          proxy.sendBytes(JSON.stringify(transferInfo));
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

  // 文件接收处理器
  private receiveFileHandlers!: Set<ReceiveFileHandler>;

  // 文本接收处理器
  private receiveTextHandlers!: Set<ReceiveTextHandler>;

  // 可用服务变更处理器
  private availableServicesUpdateHandlers!: Set<AvailableServiceUpdateHandler>;

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
    this.receiveFileHandlers = new Set();
    this.receiveTextHandlers = new Set();
    this.availableServicesUpdateHandlers = new Set();
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
      if (process.env.RUNTIME === 'e2e') {
        console.log('Socket connected: ', remote.address, remote.port);
      }
      const proxy = new Protocol(socket);

      let transferInfo: TransferInfo | null = null;
      // 上一次至今接收的字节数
      let lastReceivedBytes = 0;
      // 共接收字节数
      let receivedBytes = 0;
      // 上一次时间戳
      let lastReceivedTime = 0;
      // 不是流式接收时需要拼接完整buffer
      // TransferType 为 TEXT 时直接写入 Buffer
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
          console.log('接收文件时出错', error);
          this.receiveFileHandlers.forEach((handler) => {
            handler(
              {} as any,
              JsonResponse.fail(errcode.PROTOCOL_EXCEPTION, error.message),
            );
          });
          transferInfo = null;
          console.log();
          return;
        }

        if (!transferInfo) {
          // 接收TransferInfo时不是流，需要完整接收JSON
          chunk = Buffer.concat([chunk, buffer]);
          if (status !== ProtocolStatus.DONE) {
            if (process.env.RUNTIME === 'e2e') {
              console.log(
                '接收 TransferInfo 片段',
                buffer.length,
                '总长度: ',
                total,
              );
            }
            return;
          }
          if (process.env.RUNTIME === 'e2e') {
            console.log('接收 TransferInfo 完毕');
          }
          try {
            if (process.env.RUNTIME === 'e2e') {
              console.log('TransferInfo 原始字符串: ', chunk.toString('utf-8'));
            }
            transferInfo = JSON.parse(chunk.toString('utf-8'));
            console.log('TransferInfo: ', transferInfo);
            if (
              !this.verifiedServices.find(
                ({ id }) => id === transferInfo?.sourceId,
              )
            ) {
              if (process.env.RUNTIME === 'e2e') {
                console.log(
                  '源 ID 不在受信列表中: ',
                  transferInfo?.sourceId,
                  'IP: ',
                  remote.address,
                );
              }
              proxy
                .sendBytes(
                  JsonResponse.fail(
                    errcode.UNAUTHORIZED,
                    '未受信的设备',
                  ).toJSON(),
                )
                .finally(() => {
                  socket.end();
                });
              return;
            }
            if (process.env.RUNTIME === 'e2e') {
              console.log(
                '源 ID 在受信列表中: ',
                transferInfo?.sourceId,
                'IP: ',
                remote.address,
              );
            }
            proxy.sendBytes(JsonResponse.ok().toJSON());
          } catch (err) {
            // 忽略无法解析的JSON
            transferInfo = null;
            chunk = Buffer.alloc(0);
            if (process.env.RUNTIME === 'e2e') {
              console.log('无法解析的 TransferInfo');
            }
            socket.end();
            return;
          } finally {
            chunk = Buffer.alloc(0);
          }
        }
        if (transferInfo!.type === TransferType.FILE && !writePath) {
          // batchId和时间戳附加到原始文件名
          writePath = resolve(
            this.downloadRoot,
            `${transferInfo!.batchId}-${+new Date()}-${transferInfo!.filename}`,
          );
        }
        if (transferInfo!.type === TransferType.FILE && !writeStream) {
          writeStream = createWriteStream(writePath);
        }

        writeStream?.write(buffer);

        // 接收 TEXT 时直接写入 Buffer
        if (transferInfo!.type === TransferType.TEXT) {
          chunk = Buffer.concat([chunk, buffer]);
        }

        const done = status === ProtocolStatus.DONE;

        if (transferInfo!.type === TransferType.FILE) {
          // 只有接收 FILE 时需要回调 onProgress，接收 TEXT 时不需要
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
            this.receiveFileHandlers.forEach((handler) => {
              handler({
                ...transferInfo!,
                batchId,
                progress,
                speed,
                done,
              });
            });

            lastReceivedBytes = 0;
          }
        }

        if (done) {
          // 已经写入了最后一个buffer

          if (transferInfo!.type === TransferType.TEXT) {
            const text = chunk.toString('utf-8');

            this.receiveTextHandlers.forEach((handler) => {
              handler({
                text,
                sourceId: transferInfo!.sourceId,
                batchId: transferInfo!.batchId,
              });
            });
          }

          writeStream?.close();
          // 重置状态
          writeStream = null;
          transferInfo = null;
          writePath = '';
          batchId = '';
          lastReceivedTime = 0;
          receivedBytes = 0;
          chunk = Buffer.alloc(0);
        }
      };

      proxy.addHandler(receiveHandler);

      socket.on('end', () => {
        proxy.removeHandler(receiveHandler);
      });

      socket.on('error', (err) => {
        console.log('Socket error: ', err);
        proxy.removeHandler(receiveHandler);
        if (batchId) {
          this.receiveFileHandlers.forEach((handler) => {
            handler(
              {} as any,
              JsonResponse.fail(errcode.SOCKET_ERROR, 'Socket 连接错误'),
            );
          });
          writeStream?.close();
          writeStream = null;
          transferInfo = null;
          writePath = '';
          batchId = '';
          lastReceivedTime = 0;
          receivedBytes = 0;
        }
      });
    });

    if (process.env.RUNTIME === 'test') {
      return;
    }

    // 如果 RUNTIME 是测试，则不开启 TCP 服务
    this.tcpServer.listen(this.tcpPort, '0.0.0.0', () => {
      console.log(
        `TCP Server listening on ${ip.address('public', 'ipv4')}:${this.tcpPort}`,
      );
    });
  }

  // 初始化 UDP Socket
  private initUdpSocket() {
    return new Promise<void>((resolve) => {
      const udpHandler = (buffer: Buffer, rinfo: RemoteInfo) => {
        // 忽略本机 IP 的发包
        const localIp = ip.address('public', 'ipv4');
        if (localIp === rinfo.address) {
          return;
        }

        console.log(`UDP Socket received from ${rinfo.address}:${rinfo.port}`);

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
                rinfo.port,
                rinfo.address,
              );
              if (info) {
                // 将该 Service 作为可用来源
                const target = this.availableServices.find(
                  ({ id }) => id === info.id,
                );
                if (!target) {
                  this.availableServices.push({
                    id: info.id,
                    ip: rinfo.address,
                    port: info.port,
                    name: info.name,
                  });
                  this.availableServicesUpdateHandlers.forEach((handler) => {
                    handler();
                  });
                }
              }
              break;
            case UdpMessage.SERVICE_DEAD:
              // 远程服务挂了，把他的可用记录删了
              this.availableServices = this.availableServices.filter(
                ({ ip }) => ip !== rinfo.address,
              );
              this.availableServicesUpdateHandlers.forEach((handler) => {
                handler();
              });
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
                this.availableServices.push({
                  id: info.id,
                  ip: rinfo.address,
                  port: info.port,
                  name: info.name,
                });
                this.availableServicesUpdateHandlers.forEach((handler) => {
                  handler();
                });
              } else {
                // 使用引用更新一波已有的记录
                target.ip = rinfo.address;
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
      // 如果 RUNTIME 是测试，则不开启 UDP 服务
      if (process.env.RUNTIME === 'test') {
        return;
      }
      // UDP 只能使用熟知端口 86
      this.udpSocket.bind(86, () => {
        console.log(
          `UDP Server listening on ${ip.address('public', 'ipv4')}:86`,
        );
        // 开启广播收发能力
        this.udpSocket.setBroadcast(true);
        resolve();
      });
    });
  }
}

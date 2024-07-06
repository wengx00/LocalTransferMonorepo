import JsonResponse from './json-response';

/**
 * 服务选项
 */
export interface ServiceOptions {
  // 下载的根目录
  downloadRoot: string;
  // TCP端口，默认30
  tcpPort?: number;
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

  // 关闭服务
  dispose(): void;

  // [实验] 取消任务
  cancelTask(batchId: string): void;
}

// 发送文件请求
export interface SendFileRequest {
  // 本地文件路径
  path: string;
  // 目标设备ID
  targetId: string;
  // 传输任务创建成功回调
  onLaunch?: (context: TransferInfo) => any;
  // 传输进度回调
  onProgress?: (
    context: TransferInfo & {
      // 当前传输进度 (0-100)%
      progress: number;
      // 实时速率 KB/s
      speed: number;
    },
  ) => any;
}

// 发送文件Resolve时返回的结果
export interface SendFileResult extends TransferInfo {
  // 总耗时
  cost: number;
}

// 发送文件Reject时抛出的错误
export interface SendFileException extends TransferInfo {
  // 失败原因
  reason: string;
}

// 发送文本的请求和响应类型
export interface SendTextRequest {
  // 文本内容
  text: string;
  // 目标设备ID
  targetId: string;
}

// 发送文本reso的结果
export interface SendTextResult extends TransferInfo {}

// 发送文本Reject时抛出的错误
export interface SendTextException {
  // 失败原因
  reason: string;
}

// 接收文件监听器
export type ReceiveFileHandler = (
  context: TransferInfo & {
    // 当前传输进度 (0-100)%
    progress: number;
    // 实时速率 KB/s
    speed: number;
    // 是否已结束
    done: boolean;
  },
  err?: JsonResponse,
) => any;

// 接收文本监听器
export type ReceiveTextHandler = (context: {
  batchId: string;
  text: string;
  sourceId: string;
}) => any;

// 可用服务更新回调函数
export type AvailableServiceUpdateHandler = () => void;

export enum TransferType {
  FILE = 1,
  TEXT = 2,
}

/**
 * 传输信息
 */
export interface TransferInfo {
  // 传输批次ID
  batchId: string;
  // 原始文件名 为文本此属性为空
  filename: string;
  // 文件大小，文本时为文本长度
  size: number;
  // 类型 1为文件，2为文本
  type: TransferType;
  // 来源ID
  sourceId: string;
  // 目标ID
  targetId: string;
}

// 任务状态
export interface TaskStatus {
  cancelled: boolean;
  errMsg?: string;
}

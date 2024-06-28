import JsonResponse from './json-response';

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
}

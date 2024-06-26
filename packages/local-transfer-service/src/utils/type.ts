export interface FileInfo {
  // 传输批次ID
  batchId: string;
  // 原始文件名 为文本此属性为空
  filename: string;
  // 文件大小
  size: number;
  // 类型 1为文件，2为文本
  type: number;
}

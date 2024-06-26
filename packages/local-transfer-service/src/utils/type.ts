export interface FileInfo {
  // 传输批次ID
  batchId: string;
  // 原始文件名
  filename: string;
  // 文件大小
  size: number;
}

export interface TextInfo {
  // 文本内容
  text: string;
  // 文本大小
  size: number;
  // 传输批次ID
  batchId: string;
}

declare module '@ipc/service' {
  import {
    AvailableServiceUpdateHandler,
    ReceiveFileHandler,
    ReceiveTextHandler,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SendFileException,
    SendFileRequest,
    SendFileResult,
    SendTextRequest,
    SendTextResult,
    ServiceInfo
  } from 'local-transfer-service';

  interface ServiceApi extends IpcApi {
    invoke: {
      /**
       * 获取设备唯一 ID (8 位 nanoid)
       */
      getId(): Promise<string>;

      /**
       * 获取设备名称
       */
      getName(): Promise<string>;

      /**
       * 设置设备名称
       * @param name 设备名称
       */
      setName(name: string): Promise<void>;

      /**
       * 设置 TCP 端口，注意，更改可能产生副作用，传输文件的过程可能中断
       * @param port 本地端口
       */
      setTcpPort(port: number): Promise<void>;

      /**
       * 获取 TCP 端口
       * @returns TCP 端口
       */
      getTcpPort(): Promise<number>;

      /**
       * 获取下载根目录
       * @returns 下载根目录
       */
      getDownloadRoot(): Promise<string>;

      /**
       * 设置下载根目录
       * @param path 下载根目录
       */
      setDownloadRoot(path: string): Promise<void>;

      /**
       * 获取可用设备列表
       * @returns 可用设备列表
       */
      getAvailableServices(): Promise<ServiceInfo[]>;

      /**
       * 获取受信设备列表
       * @returns 受信设备列表
       */
      getVerifiedDevices(): Promise<ServiceInfo[]>;

      /**
       * 添加受信设备
       * @param id 可用设备ID
       * @returns 更新后的的受信设备列表
       */
      addVerifiedDevice(id: string): Promise<ServiceInfo[]>;

      /**
       * 删除受信设备
       * @returns 更新后的的受信设备列表
       * @param id 受信设备ID
       */
      removeVerifiedDevice(id: string): Promise<ServiceInfo[]>;

      /**
       * 清空受信列表
       * @returns 更新后的的受信设备列表，永远返回空数组
       */
      clearVerifiedDevices(): Promise<ServiceInfo[]>;

      /**
       * 指定目标发送文件
       * @param request 发送文件请求
       * @returns Promise 成功时回调 {SendFileResult}，失败时抛出 {SendFileException}
       * @throws {SendFileException}
       */
      sendFile(request: Omit<SendFileRequest, 'onLaunch' | 'onDone'>): Promise<SendFileResult>;

      /**
       * 指定目标发送文本
       * @param request 发送文本请求
       */
      sendText(request: SendTextRequest): Promise<SendTextResult>;

      /**
       * 刷新可用设备列表
       */
      refresh(): Promise<void>;

      /**
       * 关闭设备
       */
      dispose(): Promise<void>;
    };
    listener: {
      receiveFile(handler: ReceiveFileHandler): Promise<void>;
      receiveText(handler: ReceiveTextHandler): Promise<void>;
      availableServicesUpdate(handler: AvailableServiceUpdateHandler): Promise<void>;
      sendFileOnProgress(handler: SendFileRequest['onProgress']): Promise<any>;
      sendFileOnLaunch(handler: SendFileRequest['onLaunch']): Promise<any>;
    };
  }
}

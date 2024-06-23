declare module '@ipc/service' {
  import {
    ReceiveHandler,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SendFileException,
    SendFileRequest,
    SendFileResult,
    ServiceInfo
  } from 'local-transfer-service';

  interface ServiceApi extends IpcApi {
    invoke: {
      /**
       * 获取设备唯一 ID (8 位 nanoid)
       */
      getId(): string;

      /**
       * 获取设备名称
       */
      getName(): string;

      /**
       * 设置设备名称
       * @param name 设备名称
       */
      setName(name: string): void;

      /**
       * 设置 TCP 端口，注意，更改可能产生副作用，传输文件的过程可能中断
       * @param port 本地端口
       */
      setTcpPort(port: number): void;

      /**
       * 设置下载根目录
       * @param path 下载根目录
       */
      setDownloadRoot(path: string): void;

      /**
       * 获取可用设备列表
       * @returns 可用设备列表
       */
      getAvailableServices(): ServiceInfo[];

      /**
       * 获取受信设备列表
       * @returns 受信设备列表
       */
      getVerifiedDevices(): ServiceInfo[];

      /**
       * 添加受信设备
       * @param id 可用设备ID
       * @returns 更新后的的受信设备列表
       */
      addVerifiedDevice(id: string): ServiceInfo[];

      /**
       * 删除受信设备
       * @returns 更新后的的受信设备列表
       * @param id 受信设备ID
       */
      removeVerifiedDevice(id: string): ServiceInfo[];

      /**
       * 清空受信列表
       * @returns 更新后的的受信设备列表，永远返回空数组
       */
      clearVerifiedDevices(): ServiceInfo[];

      /**
       * 指定目标发送文件
       * @param request 发送文件请求
       * @returns Promise 成功时回调 {SendFileResult}，失败时抛出 {SendFileException}
       * @throws {SendFileException}
       */
      sendFile(request: SendFileRequest): Promise<SendFileResult>;

      /**
       * 刷新可用设备列表
       */
      refresh(): void;
    };
    listener: {
      onReceiveFile(handler: ReceiveHandler): void;
    };
  }
}

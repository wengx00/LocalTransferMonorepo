declare module '@ipc/native' {
  import { FileFilter } from 'electron';

  export type PathType =
    // 用户主页
    | 'home'
    // 应用程序数据
    | 'appData'
    // 应用程序用户数据
    | 'userData'
    // Session 生成的数据
    | 'sessionData'
    // 临时文件夹
    | 'temp'
    // 当前可执行文件夹
    | 'exe'
    // 桌面
    | 'desktop'
    // 文档
    | 'documents'
    // 下载
    | 'downloads'
    // 音乐
    | 'music'
    // 图片
    | 'pictures';
  export interface NativeApi extends IpcApi {
    invoke: {
      /**
       * 打开文件选择对话框
       * @returns 选中的文件路径，未选时就是undefined
       */
      openFileDialog(options?: {
        // 对话框标题
        title?: string;
        // 默认打开的路径
        defaultPath?: string;
        // 确认按钮上的文案
        buttonLabel?: string;
        // 文件类型
        filters?: FileFilter[];
        properties?: {
          // 允许选择文件
          openFile?: boolean;
          // 允许选择文件夹
          openDirectory?: boolean;
          // 允许多选
          multiSelections?: boolean;
          // 显示隐藏文件
          showHiddenFiles?: boolean;
        };
      }): Promise<string[] | undefined>;

      /**
       * 获取相关目录地址
       * @param type 目录类型
       * @returns 目录地址
       */
      getPath(type: PathType): Promise<string>;
      /**
       * 获取设备类型
       * @returns 设备类型
       */
      getPlatform(): Promise<string>;
      /**
       * 获取本机用户名
       * @returns 用户名
       */
      getHostname(): Promise<string>;
      /**
       * 获取本地运行时
       * @returns 运行时
       */
      getRuntime(): Promise<string>;
      /**
       * 设置本地运行时
       */
      setRuntime(value: string): Promise<void>;
      /**
       * 写入剪贴板
       */
      writeClipboard(value: string): Promise<void>;
    };
  }
}

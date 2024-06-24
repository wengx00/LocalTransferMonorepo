import { WebContents, ipcMain } from 'electron';

export default function makeInstance<T extends IpcApi>(
  helper: IpcMainHelper<T>,
  webContents?: WebContents
) {
  const emitter = {};

  const channelName = `ns-${0}`;

  ipcMain.handle(channelName, async (_event, cmd: string, ...args: any[]) => {
    if (helper.handler[cmd]) {
      return await helper.handler[cmd](...args);
    }
  });

  const emitterProxyHandler = {
    get(_target: any, prop: string | symbol) {
      const curProp = prop.toString();
      return (payload: any) => {
        try {
          webContents?.emit(channelName, {
            cmd: curProp,
            payload
          });
        } catch (err) {
          console.log('[IpcMain] emit error:', err);
        }
      };
    }
  };

  return {
    emitter: new Proxy(emitter, emitterProxyHandler)
  } as IpcMainApi<T>;
}

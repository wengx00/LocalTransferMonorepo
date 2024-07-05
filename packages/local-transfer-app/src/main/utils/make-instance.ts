import { WebContents, ipcMain } from 'electron';
import { JsonResponse } from 'local-transfer-service';

export default function makeInstance<T extends IpcApi>(
  namespace: string,
  helper: IpcMainHelper<T>,
  webContents?: WebContents
) {
  const emitter = {};

  const channelName = `ns-${namespace}-${0}`;

  ipcMain.handle(channelName, async (_event, cmd: string, args: any) => {
    if (helper.handler[cmd]) {
      try {
        return await helper.handler[cmd](...args);
      } catch (err: any) {
        console.log('[IpcMain] handle error:', err);
        if (err?.retcode !== undefined) {
          return err;
        } else {
          return JsonResponse.fail(500, 'IPC接口调用异常');
        }
      }
    }
  });

  const emitterProxyHandler = {
    get(_target: any, prop: string | symbol) {
      const curProp = prop.toString();
      return (payload: any) => {
        console.log('ipcMain emitter emit', curProp, payload);
        try {
          webContents!.send(channelName, {
            cmd: curProp,
            payload
          });
        } catch (err) {
          console.error('[IpcMain] emit error:', err);
          throw err;
        }
      };
    }
  };

  return {
    emitter: new Proxy(emitter, emitterProxyHandler)
  } as IpcMainApi<T>;
}

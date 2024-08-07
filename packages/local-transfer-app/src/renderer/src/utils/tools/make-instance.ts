import { WebContents } from 'electron';
import { nanoid } from 'nanoid';

const ipcRenderer = window.electron.ipcRenderer;

export default function makeInstance<T extends IpcApi>(
  namespace: string,
  webContents?: WebContents
) {
  const invoke = {};
  const listener = {};

  const webContentsId = webContents?.id || 0;
  const channelName = `ns-${namespace}-${webContentsId}`;

  const listenerRecords: Record<string, Map<string, (...args: any[]) => any>> = {};

  const invokeProxyHandler = {
    get(_target: any, prop: string | symbol) {
      const curProp = prop.toString();
      return async (...params: any[]) => {
        const result = await ipcRenderer.invoke(channelName, curProp, ...params);
        if (result?.retcode !== undefined && result.retcode !== 0) {
          return Promise.reject(result);
        }
        return result;
      };
    }
  };

  const bindProxyHandler = {
    get(_target: any, prop: string | symbol) {
      const curProp = prop.toString();
      return (callback: (...args: any[]) => any) => {
        if (listenerRecords[curProp] === undefined) {
          listenerRecords[curProp] = new Map();
        }
        const cbId = nanoid(12);

        listenerRecords[curProp].set(cbId, callback);

        return () => {
          listenerRecords[curProp].delete(cbId);
        };
      };
    }
  };

  ipcRenderer.on(channelName, async (_event, params: Record<string, any>) => {
    const { cmd, payload } = params;
    console.log('ipcRenderer:receive event from ipcMain:', cmd, payload);
    const eventHandlers = listenerRecords[cmd];

    if (!eventHandlers) {
      return;
    }

    const promises: Promise<any>[] = [];

    eventHandlers.forEach((eventHandler) => {
      Promise.resolve(eventHandler.call(null, ...payload));
    });

    Promise.allSettled(promises).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.error('[IpcClient] listener error:', result.reason);
        }
      });
    });
  });

  return {
    invoke: new Proxy(invoke, invokeProxyHandler),
    listener: new Proxy(listener, bindProxyHandler)
  } as T;
}

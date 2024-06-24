interface IpcApi {
  invoke: Record<string, (...args: any[]) => any>;
  listener: Record<string, (...args: any[]) => any>;
}

interface IpcMainApi<T extends IpcApi> {
  emitter: Record<keyof T['listener'], (payload: any) => any>;
}

interface IpcMainHelper<T extends IpcApi> {
  handler: T['invoke'];
}

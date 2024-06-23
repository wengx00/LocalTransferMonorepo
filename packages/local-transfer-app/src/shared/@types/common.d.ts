interface IpcApi {
  invoke: Record<string, (...args: any[]) => any>;
  listener: Record<string, (...args: any[]) => any>;
}

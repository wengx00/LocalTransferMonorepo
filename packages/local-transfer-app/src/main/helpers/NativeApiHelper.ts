import { NativeApi } from '@ipc/native';
import { app, clipboard, dialog } from 'electron';
import { type, hostname } from 'os';

export default class NativeApiHelper implements IpcMainHelper<NativeApi> {
  handler: NativeApi['invoke'] = {
    getPath(type) {
      return app.getPath(type) as any;
    },
    openFileDialog(options) {
      const { title, defaultPath, buttonLabel, filters = [], properties = {} } = options ?? {};
      return new Promise((resolve, reject) => {
        dialog
          .showOpenDialog({
            title,
            defaultPath,
            buttonLabel,
            filters,
            properties: Object.entries(properties)
              .filter(([, value]) => value)
              .map(([key]) => key) as any
          })
          .then((res) => {
            resolve(res.filePaths);
          })
          .catch(reject);
      });
    },
    getPlatform(): Promise<string> {
      return new Promise((resolve, reject) => {
        try {
          const platFormType = type();
          let device: string;
          switch (platFormType) {
            case 'Windows_NT':
              device = 'Windows';
              break;
            case 'Darwin':
              device = 'macOS';
              break;
            case 'Linux':
              device = 'Linux';
              break;
            default:
              device = 'PC';
          }
          resolve(device);
        } catch (error) {
          reject(error);
        }
      });
    },
    async getHostname() {
      return hostname();
    },
    async getRuntime() {
      return process.env.RUNTIME || 'production';
    },
    async setRuntime(value) {
      process.env.RUNTIME = value;
      return Promise.resolve();
    },
    async writeClipboard(value) {
      clipboard.writeText(value);
      return Promise.resolve();
    }
  };
}

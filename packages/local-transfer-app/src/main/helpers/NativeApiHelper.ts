import { NativeApi } from '@ipc/native';
import { app, dialog } from 'electron';

export default class NativeApiHelper implements IpcMainHelper<NativeApi> {
  handler: NativeApi['invoke'] = {
    async getPath(type) {
      return app.getPath(type);
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
    }
  };
}

import { ElectronAPI } from '@electron-toolkit/preload';
import { ServiceApi } from '@ipc/service';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      service: ServiceApi;
    };
  }
}

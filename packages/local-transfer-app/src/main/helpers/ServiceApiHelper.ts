import { ServiceApi } from '@ipc/service';
import namespace from '@shared/namespace';
import { WebContents } from 'electron';
import { Service } from 'local-transfer-service';
import NativeApiHelper from './NativeApiHelper';

export const service = new Service({
  downloadRoot: new NativeApiHelper().handler.getPath('downloads') as any
});

export default class ServiceApiHelper implements IpcMainHelper<ServiceApi> {
  constructor(readonly webContents: WebContents) {
    this.handler = {
      async getName() {
        return service.getName();
      },
      async getId() {
        return service.getId();
      },
      async setName(name) {
        return service.setName(name);
      },
      async setTcpPort(port) {
        return service.setTcpPort(port);
      },
      async setDownloadRoot(path) {
        return service.setDownloadRoot(path);
      },
      async refresh() {
        return service.refresh();
      },
      async getAvailableServices() {
        return service.getAvailableServices();
      },
      async addVerifiedDevice(id) {
        return service.addVerifiedDevice(id);
      },
      async removeVerifiedDevice(id) {
        return service.removeVerifiedDevice(id);
      },
      async clearVerifiedDevices() {
        return service.clearVerifiedDevices();
      },
      async getVerifiedDevices() {
        return service.getVerifiedDevices();
      },
      sendFile(request) {
        const channelName = `ns-${namespace.service}-${0}`;
        return service.sendFile({
          ...request,
          onLaunch(context) {
            webContents.send(channelName, {
              cmd: 'sendFileOnLaunch',
              payload: context
            });
          },
          onProgress(context) {
            webContents.send(channelName, {
              cmd: 'sendFileOnProgress',
              payload: context
            });
          }
        });
      },
      async sendText(request) {
        return service.sendText(request);
      },
      async getTcpPort() {
        return service.getTcpPort();
      },
      async getDownloadRoot() {
        return service.getDownloadRoot();
      },
      async dispose() {
        return service.dispose();
      },
      async cancelTask(batchId) {
        return service.cancelTask(batchId);
      }
    };
  }
  handler: IpcMainHelper<ServiceApi>['handler'];
}

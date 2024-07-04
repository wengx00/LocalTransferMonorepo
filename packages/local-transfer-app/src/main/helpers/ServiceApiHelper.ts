import { ServiceApi } from '@ipc/service';
import { Service } from 'local-transfer-service';
import NativeApiHelper from './NativeApiHelper';

export const service = new Service({
  downloadRoot: new NativeApiHelper().handler.getPath('downloads') as any
});

export default class ServiceApiHelper implements IpcMainHelper<ServiceApi> {
  handler: ServiceApi['invoke'] = {
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
      return service.sendFile(request);
    },
    async getTcpPort() {
      return service.getTcpPort();
    },
    async getDownloadRoot() {
      return service.getDownloadRoot();
    },
    async dispose() {
      return service.dispose();
    }
  };
}

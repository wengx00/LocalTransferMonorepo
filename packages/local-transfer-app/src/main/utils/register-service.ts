import { ServiceApi } from '@ipc/service';
import { IService, ReceiveFileHandler, ReceiveTextHandler } from 'local-transfer-service';

export default function registerService(service: IService, api: IpcMainApi<ServiceApi>) {
  const receiveFileHandler: ReceiveFileHandler = (context) => {
    api.emitter.receiveFile(context);
  };
  const receiveTextHandler: ReceiveTextHandler = (context) => {
    api.emitter.receiveText(context);
  };
  service.addReceiveFileHandler(receiveFileHandler);
  service.addReceiveTextHandler(receiveTextHandler);

  return () => {
    service.removeFileReceiveHandler(receiveFileHandler);
    service.removeReceiveTextHandler(receiveTextHandler);
  };
}

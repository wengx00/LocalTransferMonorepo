import { ServiceApi } from '@ipc/service';
import {
  AvailableServiceUpdateHandler,
  IService,
  ReceiveFileHandler,
  ReceiveTextHandler
} from 'local-transfer-service';

export default function registerService(service: IService, api: IpcMainApi<ServiceApi>) {
  const receiveFileHandler: ReceiveFileHandler = (context, err) => {
    api.emitter.receiveFile(context, err);
  };
  const receiveTextHandler: ReceiveTextHandler = (context) => {
    api.emitter.receiveText(context);
  };

  const availableServicesUpdateHandler: AvailableServiceUpdateHandler = () => {
    api.emitter.availableServicesUpdate(undefined);
  };

  service.addReceiveFileHandler(receiveFileHandler);
  service.addReceiveTextHandler(receiveTextHandler);
  service.addAvailableServicesUpdateHandler(availableServicesUpdateHandler);

  return () => {
    service.removeFileReceiveHandler(receiveFileHandler);
    service.removeReceiveTextHandler(receiveTextHandler);
    service.removeAvailableServicesUpdateHandler(availableServicesUpdateHandler);
  };
}

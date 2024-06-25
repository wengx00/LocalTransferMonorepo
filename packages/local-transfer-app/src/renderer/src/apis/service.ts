import { ServiceApi } from '@ipc/service';
import makeInstance from '@renderer/utils/tools/make-instance';
import namespace from '@shared/namespace';

const serviceApi = makeInstance<ServiceApi>(namespace.service);

export default serviceApi;

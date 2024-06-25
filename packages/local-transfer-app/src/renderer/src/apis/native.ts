import { NativeApi } from '@ipc/native';
import makeInstance from '@renderer/utils/tools/make-instance';
import namespace from '@shared/namespace';

const nativeApi = makeInstance<NativeApi>(namespace.native);

export default nativeApi;

import nativeApi from '@renderer/apis/native';
import serviceApi from '@renderer/apis/service';
import interact from '@renderer/utils/interact';
import { ServiceInfo } from 'local-transfer-service';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useServiceInfo = defineStore('service-info', () => {
  // Service 名称
  const serviceName = ref('');
  // Service ID
  const serviceId = ref('');
  // 下载根目录
  const downloadRoot = ref('');
  // TCP 端口
  const tcpPort = ref(86);
  // 可用设备列表
  const availableServices = ref<ServiceInfo[]>([]);
  // 受信设备列表
  const verifiedServices = ref<ServiceInfo[]>([]);

  // 从 ServiceAPI 初始化设备信息
  async function initInfo() {
    const initNameTask = async () => {
      serviceName.value = await serviceApi.invoke.getName();
      console.log('当前设备名称', serviceName.value);
      if (serviceName.value.length === 0) {
        const osType = await nativeApi.invoke.getPlatform();
        const hostname = await nativeApi.invoke.getHostname();
        console.log('系统类型', osType, '主机名', hostname);
        await setServiceName(`${osType}-${hostname}`);
        console.log('使用默认设备名称', serviceName.value);
      }
    };

    const initServicesTask = async () => {
      availableServices.value = await serviceApi.invoke.getAvailableServices();
      verifiedServices.value = await serviceApi.invoke.getVerifiedDevices();
      console.log('Available Services:', availableServices.value);
      console.log('Verified Services:', verifiedServices.value);
    };

    // 注册更新回调
    serviceApi.listener.availableServicesUpdate(initServicesTask);

    await Promise.all([
      initNameTask(),
      initServicesTask(),
      (serviceId.value = await serviceApi.invoke.getId()),
      (downloadRoot.value = await serviceApi.invoke.getDownloadRoot()),
      (tcpPort.value = await serviceApi.invoke.getTcpPort())
    ]).finally(() => {
      console.log('初始化设备信息');
    });
  }

  // 授权
  async function authorize(targetId: string) {
    if (!availableServices.value.find(({ id }) => id === targetId)) {
      interact.message.error('该设备不存在，请刷新可用列表');
      return;
    }
    await serviceApi.invoke.addVerifiedDevice(targetId);
    verifiedServices.value = await serviceApi.invoke.getVerifiedDevices();
    interact.message.success('授权成功');
  }

  // 取消授权
  async function unauthorize(targetId: string) {
    await serviceApi.invoke.removeVerifiedDevice(targetId);
    verifiedServices.value = await serviceApi.invoke.getVerifiedDevices();
    interact.message.success('取消授权成功');
  }

  // 设置 Service 名称
  async function setServiceName(name: string) {
    await serviceApi.invoke.setName(name);
    serviceName.value = name;
    console.log('设置设备名称', name);
  }

  // 设置下载根目录
  async function setDownloadRoot(path: string) {
    await serviceApi.invoke.setDownloadRoot(path);
    downloadRoot.value = path;
  }

  return {
    serviceName,
    serviceId,
    downloadRoot,
    tcpPort,
    availableServices,
    verifiedServices,

    initInfo,
    setServiceName,
    setDownloadRoot,
    authorize,
    unauthorize
  };
});

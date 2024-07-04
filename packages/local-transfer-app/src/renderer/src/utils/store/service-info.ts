import nativeApi from '@renderer/apis/native';
import serviceApi from '@renderer/apis/service';
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

    await Promise.all([
      initNameTask(),
      (serviceId.value = await serviceApi.invoke.getId()),
      (downloadRoot.value = await serviceApi.invoke.getDownloadRoot()),
      (tcpPort.value = await serviceApi.invoke.getTcpPort())
    ]).finally(() => {
      console.log('初始化设备信息');
    });
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

    initInfo,
    setServiceName,
    setDownloadRoot
  };
});

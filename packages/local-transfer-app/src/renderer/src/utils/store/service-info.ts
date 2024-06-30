import serviceApi from '@renderer/apis/service';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useServiceInfo = defineStore('service-info', () => {
  // Service 名称
  const serviceName = ref('');
  // Service ID
  const serviceId = ref('');

  // 从 ServiceAPI 刷新信息
  async function refresh() {
    await Promise.all([
      (serviceName.value = await serviceApi.invoke.getName()),
      (serviceId.value = await serviceApi.invoke.getId())
    ]);
  }

  // 设置 Service 名称
  async function setServiceName(name: string) {
    await serviceApi.invoke.setName(name);
    serviceName.value = name;
  }

  return {
    serviceName,
    serviceId,

    refresh,
    setServiceName
  };
});

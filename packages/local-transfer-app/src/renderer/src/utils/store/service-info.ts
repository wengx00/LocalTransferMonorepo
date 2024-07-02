import serviceApi from '@renderer/apis/service';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useServiceInfo = defineStore('service-info', () => {
  // Service 名称
  const serviceName = ref('');
  // Service ID
  const serviceId = ref('');

  // 从 ServiceAPI 刷新信息
  async function initInfo() {
    await Promise.all([
      (serviceName.value = await serviceApi.invoke.getName()),
      (serviceId.value = await serviceApi.invoke.getId())
    ]).finally(() => {
      console.log('刷新设备信息');
    });
  }

  // 设置 Service 名称
  async function setServiceName(name: string) {
    await serviceApi.invoke.setName(name);
    serviceName.value = name;
  }

  //获取 Service 名称
  async function getServiceName() {
    serviceName.value = await serviceApi.invoke.getName();
  }

  // 设备列表
  const nearbyDevices = ref([
    {
      devname: '想喝益力多的mac',
      devtype: 'mac',
      devid: '123456789',
      isSign: true,
      deviceTrust: true
    },
    {
      devname: 'pwq的Windows',
      devtype: 'windows',
      devid: '22222222222',
      isSign: true,
      deviceTrust: true
    },
    {
      devname: 'linux',
      devtype: 'linux',
      devid: '222122',
      isSign: true,
      deviceTrust: false
    },
    {
      devname: '不知道',
      devtype: 'windows',
      devid: '2222872222222',
      isSign: false,
      deviceTrust: true
    },
    {
      devname: '未知',
      devtype: 'linux',
      devid: '2223732322',
      isSign: false,
      deviceTrust: true
    }
  ]);
  return {
    serviceName,
    serviceId,
    nearbyDevices,

    initInfo,
    setServiceName,
    getServiceName
  };
});

<template>
  <div class="receive-file">
    <div class="device-info">
      <div class="recent-receive">
        <div class="refresh-button">
          <p>附近设备</p>
          <img
            :class="refreshing ? 'refresh rotate' : 'notRefresh'"
            :src="refreshAct"
            @click="refreshNearbyDevices"
          />
        </div>
        <ul>
          <li
            v-for="item in serviceInfo.nearbyDevices"
            :key="item.devid"
            :class="{ selected: selectedNearbyDevice.devid === item.devid }"
            @click="selectNearbyDevice(item)"
          >
            <span :class="['status-circle', item.isSign ? 'online' : 'offline']"></span>
            <img class="device-icon" :src="getImage(item)" :alt="item.devtype" />
            <p class="device-name" :title="item.devname">{{ item.devname }}</p>
            <div :class="item.deviceTrust ? 'deviceTrust' : 'deviceNotTrust'">
              {{ item.deviceTrust ? '已信任' : '未信任' }}
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="device-detail">
      <div class="deviceInfo">
        <p class="device-detail-name">{{ selectedDevice?.devname || '无设备' }}</p>
      </div>
      <div class="device-status">
        <img
          v-if="selectedDevice?.isSign"
          class="computer"
          src="../../assets/image/File.png"
          alt="File"
        />
        <img
          v-if="!selectedDevice?.isSign"
          class="computer"
          src="../../assets/image/noNetork.png"
          alt="noNetork"
        />
        <p>{{ selectedDevice?.isSign ? '设备在线' : '设备离线' }}</p>
      </div>
      <t-col class="sendFile-button">
        <button class="receive-button" @click="trustDevice">
          {{ selectedDevice?.deviceTrust ? '解除信任' : '信任设备' }}
        </button>
      </t-col>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import macAct from '../../assets/image/macAct.png';
import mac from '../../assets/image/mac.png';
import windows from '../../assets/image/windows.png';
import windowsAct from '../../assets/image/windowsAct.png';
import linuxAct from '../../assets/image/linuxAct.png';
import linux from '../../assets/image/linux.png';
import refreshAct from '../../assets/image/refreshAct.png';
import serviceApi from '@renderer/apis/service';
import nativeApi from '@renderer/apis/native';
import interact from '@renderer/utils/interact';
import { useServiceInfo } from '@renderer/utils/store/service-info';
import { useReceiveController } from '@renderer/utils/store/receive-controller';

const serviceInfo = useServiceInfo();
const receiveController = useReceiveController();

const pathType = ref('downloads');
const selectedNearbyDevice = ref(serviceInfo.nearbyDevices[0]);
const selectedDevice = ref(selectedNearbyDevice.value);
const refreshing = ref(false);

const images = {
  macAct,
  mac,
  windows,
  windowsAct,
  linuxAct,
  linux
};

const getImage = (item) => {
  if (item.isSign) {
    return images[`${item.devtype}Act`];
  }
  return images[item.devtype];
};

const selectNearbyDevice = (device) => {
  selectedNearbyDevice.value = device;
  selectedDevice.value = device;
};

const trustDevice = async () => {
  if (!selectedDevice.value.deviceTrust) {
    await serviceApi.invoke.addVerifiedDevice(selectedNearbyDevice.value.devid);
  } else {
    await serviceApi.invoke.removeVerifiedDevice(selectedNearbyDevice.value.devid);
  }
  await initNearbyDevices();
};

const refreshNearbyDevices = async () => {
  refreshing.value = true;
  await initNearbyDevices();
  setTimeout(() => {
    refreshing.value = false;
  }, 1500);
};

const initNearbyDevices = async () => {
  try {
    const Devices = await serviceApi.invoke.getAvailableServices();
    const trustedDevices = await serviceApi.invoke.getVerifiedDevices();
    const tempDevices = Devices.map((item) => ({
      devname: item.name || '未知设备',
      devtype: 'mac', // 这里需要返回设备类型
      devid: item.id || '',
      isSign: true,
      deviceTrust: trustedDevices.some((trusted) => trusted.id === item.id)
    }));
    serviceInfo.nearbyDevices = tempDevices;
    console.log('设备列表', tempDevices);
    if (serviceInfo.nearbyDevices.length > 0) {
      selectedNearbyDevice.value = serviceInfo.nearbyDevices[0];
      selectedDevice.value = serviceInfo.nearbyDevices[0];
    }
  } catch (err) {
    console.error('Failed to refresh nearby devices', err);
  }
};

// 获取目标目录路径
async function getTargetPath() {
  const localPath = localStorage.getItem('pathType');
  if (localPath) {
    pathType.value = localPath;
    console.log(localPath);
    return;
  }
  try {
    const path = await nativeApi.invoke.getPath('downloads');
    pathType.value = path;
    localStorage.setItem('pathType', path);
  } catch (err) {
    console.log(err);
    interact.message.error(String(err));
  }
}

onMounted(() => {
  initNearbyDevices();
  getTargetPath();
  receiveController.initialize();
});
</script>

<style scoped lang="scss" src="./index.scss"></style>

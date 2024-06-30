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
            v-for="item in nearbyDevices"
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
        <p class="device-detail-name">{{ selectedDevice.devname }}</p>
      </div>
      <div class="device-status">
        <img
          v-if="selectedDevice.isSign"
          class="computer"
          src="../../assets/image/File.png"
          alt="File"
        />
        <img
          v-if="!selectedDevice.isSign"
          class="computer"
          src="../../assets/image/noNetork.png"
          alt="noNetork"
        />
        <p>{{ selectedDevice.isSign ? '设备在线' : '设备离线' }}</p>
      </div>
      <t-col class="sendFile-button">
        <button class="receive-button" @click="trustDevice">
          {{ selectedDevice.deviceTrust ? '解除信任' : '信任设备' }}
        </button>
      </t-col>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import macAct from '../../assets/image/macAct.png';
import mac from '../../assets/image/mac.png';
import windows from '../../assets/image/windows.png';
import windowsAct from '../../assets/image/windowsAct.png';
import linuxAct from '../../assets/image/linuxAct.png';
import linux from '../../assets/image/linux.png';
import refreshAct from '../../assets/image/refreshAct.png';

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

const selectedNearbyDevice = ref(nearbyDevices.value[0]);
const selectedDevice = ref(selectedNearbyDevice.value);

const selectNearbyDevice = (device) => {
  selectedNearbyDevice.value = device;
  selectedDevice.value = device;
};

const trustDevice = () => {
  selectedDevice.value.deviceTrust = !selectedDevice.value.deviceTrust;
};

const refreshing = ref(false);

const refreshNearbyDevices = async () => {
  refreshing.value = true;
  // 调用接口或重新获取附近设备列表的数据
  // 这里假设需要等待一段时间来模拟异步操作
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('refresh nearby devices');
  refreshing.value = false; // 停止旋转
};
</script>

<style scoped>
.receive-file {
  display: flex;
  height: 100%;
}

.device-info {
  flex: 2;
  padding: 20px;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.recent-receive {
  margin-bottom: 20px;
}

.recent-receive ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-receive li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  cursor: pointer;
  padding: 5px;
}

.recent-receive li:hover,
.recent-receive li.selected {
  background-color: #f0f0f0;
}

.device-detail {
  flex: 3;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.device-detail p {
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 18px;
}

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notRefresh,
.refresh {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.refresh {
  transition: transform 2s ease-out;
}

.rotate {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(1080deg);
  }
}

.refresh-button p {
  font-weight: 700;
}

.device-detail-name {
  width: calc(100%-10px);
}

.deviceInfo {
  display: flex;
  justify-content: space-between;
}

.deviceTrust,
.deviceNotTrust {
  display: flex;
  align-items: center;
  min-width: 4rem;
  height: 2.5rem;
  margin-left: auto;
  padding: 3px 5px;
  font-size: 1rem;
  border-radius: 5px;
}

.deviceTrust,
.deviceNotTrust {
  background-color: #366ef4;
  color: #ffffff;
  transition:
    width 0.4s,
    background-color 0.4s;
}

.deviceTrust:hover {
  background-color: #0052d9;
}

.deviceNotTrust {
  background-color: #d3d3d3;
  color: #000000;
}

.device-status {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.device-status p {
  margin-top: 20px;
  font-size: 16px;
}

.device-icon {
  width: 20px;
  height: 20px;
}

.device-name {
  width: 45%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.computer {
  width: 50%;
  height: auto;
}

.sendFile-button {
  display: flex;
  width: 100%;
  justify-content: space-around;
  font-size: 16px;
}

.receive-button {
  width: 35%;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #366ef4;
  color: white;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 0;
  transition:
    color 0.4s,
    background-color 0.4s;
}

.receive-button:hover {
  background-color: #366ef4;
  color: white;
}

.receive-button:before {
  content: '';
  width: 0;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #0052d9;
  z-index: -1;
  transition: width 0.4s;
}

.receive-button:hover:before {
  width: 100%;
}

.status-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.online {
  background-color: green;
}

.offline {
  background-color: gray;
}
</style>

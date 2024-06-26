<template>
  <div class="receive-file">
    <div class="device-info">
      <div class="current-device">
        <p>该设备ID: {{ serviceId }}</p>
      </div>
      <div class="recent-receive">
        <details>
          <summary>附近设备</summary>
          <ul>
            <li v-for="item in nearbyDevices" :key="item.devid" @click="selectNearbyDevice(item)"
              :class="{ selected: selectedNearbyDevice.devid === item.devid }">
              <span :class="['status-circle', item.isSign ? 'online' : 'offline']"></span>
              <div v-if="item.isSign">
                <img v-if="item.devtype == 'mac'" src="../../assets/image/appleAct.png" :alt="item.devtype"
                  class="device-icon" />
                <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windowsAct.png" :alt="item.devtype" class="device-icon" />
                <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linuxAct.png" :alt="item.devtype" class="device-icon" />
              </div>
              <div v-if="!item.isSign">
                <img v-if="item.devtype == 'mac'" src="../../assets/image/apple.png" :alt="item.devtype"
                  class="device-icon" />
                <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windows.png" :alt="item.devtype" class="device-icon" />
                <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linux.png" :alt="item.devtype" class="device-icon" />
              </div>
              <p class="device-name" :title="item.devname">{{ item.devname }}</p>
            </li>
          </ul>
        </details>
      </div>
      <div class="recent-receive">
        <details>
          <summary>最近接收</summary>
          <ul>
            <li v-for="item in recentDevices" :key="item.devid" @click="selectRecentDevice(item)"
              :class="{ selected: selectedRecentDevice.devid === item.devid }">
              <span :class="['status-circle', item.isSign ? 'online' : 'offline']"></span>
              <div v-if="item.isSign">
                <img v-if="item.devtype == 'mac'" src="../../assets/image/appleAct.png" :alt="item.devtype"
                  class="device-icon" />
                <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windowsAct.png" :alt="item.devtype" class="device-icon" />
                <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linuxAct.png" :alt="item.devtype" class="device-icon" />
              </div>
              <div v-if="!item.isSign">
                <img v-if="item.devtype == 'mac'" src="../../assets/image/apple.png" :alt="item.devtype"
                  class="device-icon" />
                <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windows.png" :alt="item.devtype" class="device-icon" />
                <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linux.png" :alt="item.devtype" class="device-icon" />
              </div>



              <p class="device-name" :title="item.devname">{{ item.devname }}</p>
            </li>
          </ul>
        </details>
      </div>
    </div>
    <div class="device-detail">
      <p>{{ selectedDevice.devname }}</p>
      <div class="device-status">
        <img v-if="selectedDevice.isSign" class="computer" src="../../assets/image/File.png" alt="File" />
        <img v-if="!selectedDevice.isSign" class="computer" src="../../assets/image/noNetork.png" alt="noNetork" />
        <p>{{ selectedDevice.isSign ? "设备在线" : "设备离线" }}</p>
      </div>
      <button class="receive-button">接收文件</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import serviceApi from '@renderer/apis/service';

const serviceId = ref('');
const serviceName = ref('');

const nearbyDevices = ref([
  {
    devname: "想喝益力多的mac",
    devtype: "mac",
    devid: "123456789",
    isSign: true
  },
  {
    devname: "pwq的Windows",
    devtype: "windows",
    devid: "22222222222",
    isSign: true
  },
  {
    devname: "linux",
    devtype: "linux",
    devid: "222122",
    isSign: true
  }
]);

const recentDevices = ref([
  {
    devname: "想喝益力多的mac",
    devtype: "mac",
    devid: "123456789",
    isSign: true
  },
  {
    devname: "pwq的Windows",
    devtype: "windows",
    devid: "22222222222",
    isSign: false
  },
  {
    devname: "linux",
    devtype: "linux",
    devid: "222332322",
    isSign: false
  }
]);

const selectedNearbyDevice = ref(nearbyDevices.value[0]);
const selectedRecentDevice = ref(recentDevices.value[0]);
const selectedDevice = ref(selectedNearbyDevice.value);

const selectNearbyDevice = (device) => {
  selectedNearbyDevice.value = device;
  selectedDevice.value = device;
};

const selectRecentDevice = (device) => {
  selectedRecentDevice.value = device;
  selectedDevice.value = device;
};

async function getServiceName() {
  serviceName.value = await serviceApi.invoke.getName();
}

onMounted(async () => {
  serviceId.value = await serviceApi.invoke.getId();
  getServiceName();
});
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

.current-device {
  font-size: 18px;
  font-weight: 700;
}

.current-device,
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
  width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.computer {
  width: 50%;
  height: auto;
}

.receive-button {
  width: 30%;
  margin-left: 35%;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #0052d9;
  color: white;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 0;
  transition: color 0.4s, background-color 0.4s;
}

.receive-button:hover {
  background-color: #0052d9;
  color: white;
}

.receive-button:before {
  content: '';
  width: 0;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #366ef4;
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

<template>
  <div class="send-file">
    <div class="transfer">
      <t-button theme="primary" class="transfer-button" @click="openUploadDialog">
        <template #icon><cloud-upload-icon /></template>
        上传文件
      </t-button>
      <t-button theme="primary" class="transfer-button" @click="openTextTransferDialog">
        <template #icon><cloud-upload-icon /></template>
        上传文本
      </t-button>
    </div>
    <div class="receive-file">
      <div class="device-info">
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
                  <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windowsAct.png" :alt="item.devtype"
                    class="device-icon" />
                  <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linuxAct.png" :alt="item.devtype"
                    class="device-icon" />
                </div>
                <div v-if="!item.isSign">
                  <img v-if="item.devtype == 'mac'" src="../../assets/image/apple.png" :alt="item.devtype"
                    class="device-icon" />
                  <img v-else-if="item.devtype == 'windows'" src="../../assets/image/windows.png" :alt="item.devtype"
                    class="device-icon" />
                  <img v-else-if="item.devtype == 'linux'" src="../../assets/image/linux.png" :alt="item.devtype"
                    class="device-icon" />
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
          <img class="computer" src="../../assets/image/File.png" alt="img" />

          <p>{{ selectedDevice.isSign ? "设备在线" : "设备离线" }}</p>
        </div>
        <t-button class="sendFile-button" theme="primary" @click="sendFile">发送</t-button>
      </div>
    </div>
    <t-dialog placement="center" :visible.sync="isUploadDialogVisible" header="上传文件" width="500px"
      @close="closeUploadDialog" confirm-btn="上传">
      <div class="root">
        <t-button @click="openFileDialog">打开文件选择框</t-button>
        <div class="row">
          <t-select v-model="pathType" placeholder="选择目录类型">
            <t-option key="downloads" value="downloads" label="下载目录" />
            <t-option key="desktop" value="desktop" label="桌面" />
            <t-option key="home" value="home" label="用户目录" />
            <t-option key="exe" value="exe" label="当前可执行目录" />
            <t-option key="temp" value="temp" label="临时目录" />
          </t-select>
          <t-button style="flex-shrink: 0" @click="getTargetPath">获取目标路径</t-button>
        </div>
        <div :class="[
        'drag-area',
        {
          active: dragOver
        }
      ]" @drop="handleDropFile" @dragover="handleDragOver" @dragleave="handleDragLeave">
          将文件拖拽至此
        </div>
      </div>
    </t-dialog>

    <t-dialog placement="center" :visible.sync="isTextTransferDialogVisible" header="传输文本" width="500px"
      @close="closeTextTransferDialog" confirm-btn="传输" @confirm="transferText">
      <div class="root">
        <t-textarea v-model="textToTransfer" placeholder="请输入要传输的文本"></t-textarea>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PathType } from '@ipc/native';
import nativeApi from '@renderer/apis/native';
import interact from '@renderer/utils/interact';

const pathType = ref('');
const dragOver = ref(false);
const isUploadDialogVisible = ref(false);
const isTextTransferDialogVisible = ref(false);
const textToTransfer = ref('');

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
    devid: "222333333222",
    isSign: true
  }
]);
const selectedNearbyDevice = ref(nearbyDevices.value[0]);
const selectedDevice = ref(selectedNearbyDevice.value);
const selectNearbyDevice = (device) => {
  selectedNearbyDevice.value = device;
  selectedDevice.value = device;
};

const openUploadDialog = () => {
  isUploadDialogVisible.value = true;
};

const closeUploadDialog = () => {
  isUploadDialogVisible.value = false;
};

const openTextTransferDialog = () => {
  isTextTransferDialogVisible.value = true;
};

const closeTextTransferDialog = () => {
  isTextTransferDialogVisible.value = false;
};

// 打开文件选择框
async function openFileDialog() {
  const result = await nativeApi.invoke.openFileDialog({
    title: '选择文件',
    buttonLabel: '选择',
    filters: [
      {
        name: 'C++源文件',
        extensions: ['.cpp', '.cc', '.h', '.hpp']
      }
    ],
    properties: {
      openFile: true
    }
  });

  if (!result) {
    interact.message.warning('用户取消选择');
    return;
  }
  interact.message.warning('未选择任何文件');
}

// 获取目标目录路径
async function getTargetPath() {
  if (!pathType.value) {
    interact.message.error('请选择目录类型');
    return;
  }

  try {
    const path = await nativeApi.invoke.getPath(pathType.value as PathType);
    interact.dialog({
      title: '目标路径',
      content: path
    });
  } catch (err) {
    console.log(err);
    interact.message.error(String(err));
  }
}

// 文件拖到面板放下
function handleDropFile(e: DragEvent) {
  e.preventDefault();
  e.stopImmediatePropagation();

  dragOver.value = false;

  const files = e.dataTransfer?.files ?? [];

  const fileList: string[] = [];

  for (const file of files) {
    fileList.push(file.path);
  }

  if (fileList.length === 0) {
    interact.message.error('未选择任何文件');
  } else {
    console.log('拖拽文件路径', fileList);
    interact.notify.success({
      title: '文件拖拽',
      content: `文件拖拽成功，路径：${fileList.join(', ')}`
    });
  }
}

// 文件拖入面板
function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  dragOver.value = true;
}

// 文件拖出面板
function handleDragLeave() {
  dragOver.value = false;
}

// 传输文本
function transferText() {
  if (!textToTransfer.value.trim()) {
    interact.message.error('未输入任何文本');
  } else {
    interact.message.success('文本传输成功');
    closeTextTransferDialog();
  }
}

// 发送文件
function sendFile() {
  interact.notify.success({
    title: '发送文件',
    content: `文件发送成功到设备：${selectedDevice.value.devname}`
  });
}
</script>

<style scoped>
.send-file {
  flex: 1;
  padding: 20px;
}

.sendFile-button {
  width: 50%;
  margin-left: 25%;
  font-size: 16px;
}

.transfer {
  display: flex;
  margin: 10px 30px;
  gap: 80px;
  margin-bottom: 30px;
}

.transfer-button {
  padding: 25px;
  border: 1px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.devices {
  margin-top: 20px;
}

.device {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-icon {
  width: 20px;
  height: 20px;
}

.recent-receive {
  margin-bottom: 20px;
}

.receive-file {
  display: flex;
  height: 100%;
}

.device-info {
  flex: 1;
  padding: 20px;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
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
  flex: 1;
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

.computer {
  width: 50%;
  height: auto;
}

.root {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.2rem;
  gap: 1.2rem;
  overflow-x: hidden;
  overflow-y: auto;

  .row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.6rem;
  }

  .drag-area {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    /* 设置更高的高度 */
    border: 2px dashed var(--td-gray-color-7);
    color: var(--td-gray-color-7);
    border-radius: 8px;
    transition: all 0.25s;

    &.active {
      border: 2px dashed var(--td-brand-color);
      color: var(--td-brand-color);
    }
  }
}
</style>

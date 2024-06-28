<template>
  <div class="send-file">
    <div class="transfer">
      <t-button theme="primary" class="transfer-button" @click="showUploadFileDialog">
        <template #icon><cloud-upload-icon /></template>
        上传文件
      </t-button>
      <t-button theme="primary" class="transfer-button" @click="showTransferTextDialog">
        <template #icon><cloud-upload-icon /></template>
        上传文本
      </t-button>
    </div>
    <div class="receive-file">
      <div class="device-info">
        附近设备
        <div class="recent-receive">
          <t-checkbox-group v-model="selectedDevices">
            <ul>
              <li
                v-for="item in nearbyDevices"
                :key="item.devid"
                :class="{ selected: selectedDevices.includes(item.devid) }"
              >
                <t-checkbox :value="item.devid">
                  <div style="display: flex">
                    <img class="device-icon" :src="getImage(item)" :alt="item.devtype" />
                    <p class="device-name" :title="item.devname">{{ item.devname }}</p>
                  </div>
                </t-checkbox>
              </li>
            </ul>
          </t-checkbox-group>
        </div>
      </div>

      <div class="device-detail">
        <div v-if="isUploadFileDialogVisible" class="root">
          <div
            :class="[
              'drag-area',
              {
                active: dragOver
              }
            ]"
            @drop="handleDropFile"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            将文件拖拽至此
          </div>
          <t-col class="sendFile-button">
            <t-button @click="openFileDialog">打开文件选择框</t-button>
            <t-button theme="primary" @click="sendFile">发送</t-button>
          </t-col>
        </div>

        <div v-if="isTransferTextDialogVisible" class="root">
          <t-textarea
            v-model="textToTransfer"
            class="textareaBox"
            placeholder="请输入要传输的文本"
            :maxlength="5000"
          />
          <t-col class="sendFile-button" :offset="9">
            <t-button theme="primary" @click="transferText">发送</t-button>
          </t-col>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import nativeApi from '@renderer/apis/native';
import interact from '@renderer/utils/interact';

import macAct from '../../assets/image/macAct.png';
import mac from '../../assets/image/mac.png';
import windows from '../../assets/image/windows.png';
import windowsAct from '../../assets/image/windowsAct.png';
import linuxAct from '../../assets/image/linuxAct.png';
import linux from '../../assets/image/linux.png';

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

const dragOver = ref(false);
const isUploadFileDialogVisible = ref(false);
const isTransferTextDialogVisible = ref(false);
const textToTransfer = ref('');
const selectedFilePaths = ref<string[]>([]);
const selectedDevices = ref<string[]>([]);

const nearbyDevices = ref([
  {
    devname: '想喝益力多的mac',
    devtype: 'mac',
    devid: '123456789',
    isSign: true
  },
  {
    devname: 'pwq的Windows',
    devtype: 'windows',
    devid: '22222222222',
    isSign: true
  },
  {
    devname: 'linux',
    devtype: 'linux',
    devid: '222333333222',
    isSign: true
  }
]);

const showUploadFileDialog = () => {
  isUploadFileDialogVisible.value = true;
  isTransferTextDialogVisible.value = false;
};

const showTransferTextDialog = () => {
  isUploadFileDialogVisible.value = false;
  isTransferTextDialogVisible.value = true;
};
onMounted(() => {
  showUploadFileDialog();
});

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
      openFile: true,
      openDirectory: true,
      multiSelections: true
    }
  });

  if (!result) {
    interact.message.warning('用户取消选择');
    return;
  }

  selectedFilePaths.value = result || [];
  if (selectedFilePaths.value.length === 0) {
    interact.message.warning('未选择任何文件');
  } else {
    interact.message.success('文件选择成功');
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
  if (selectedDevices.value.length === 0) {
    interact.message.error('请选择一个设备');
    return;
  }

  if (!textToTransfer.value.trim()) {
    interact.message.error('未输入任何文本');
    return;
  } else {
    interact.message.success('文本传输成功');
  }
}

// 发送文件
function sendFile() {
  if (selectedDevices.value.length === 0) {
    interact.message.error('请选择一个设备');
    return;
  }

  if (selectedFilePaths.value.length === 0) {
    interact.message.error('未选择任何文件');
    return;
  }

  interact.notify.success({
    title: '发送文件',
    content: `文件发送成功到设备：${selectedDevices.value.join(', ')}`
  });
}
</script>

<style scoped>
.send-file {
  flex: 1;
  padding: 20px;
}

.sendFile-button {
  display: flex;
  width: 100%;
  justify-content: space-between;
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
  margin-right: 5px;
}

.device-name {
  width: calc(100% - 25px);
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 5px 25px 5px 10px;
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
    height: 300px;
    border: 2px dashed var(--td-gray-color-7);
    color: var(--td-gray-color-7);
    border-radius: 8px;
    transition: all 0.25s;

    &.active {
      border: 2px dashed var(--td-brand-color);
      color: var(--td-brand-color);
    }
  }

  .t-textarea__inner {
    display: flex;
    width: 100%;
    height: 300px;
  }

  .textareaBox {
    height: 300px;
  }
}
</style>

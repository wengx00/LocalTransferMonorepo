<template>
  <div class="send-file">
    <div class="transfer">
      <t-button theme="primary" class="transfer-button" @click="showUploadFileDialog">
        <template #icon><CloudUploadIcon /></template>
        上传文件
      </t-button>
      <t-button theme="primary" class="transfer-button" @click="showTransferTextDialog">
        <template #icon><CloudUploadIcon /></template>
        上传文本
      </t-button>
    </div>
    <div class="receive-file">
      <div class="device-info">
        <div class="refresh-button">
          <p>选择发送的设备</p>
          <img
            :class="refreshing ? 'refresh rotate' : 'notRefresh'"
            :src="refreshAct"
            @click="refreshNearbyDevices"
          />
        </div>
        <div class="recent-receive">
          <t-checkbox-group v-model="selectedDevices">
            <ul>
              <li
                v-for="item in serviceInfo.nearbyDevices"
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
            @click="openFileDialog"
            @drop.prevent="handleDropFile"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
          >
            点击选择或将文件拖拽至此
          </div>
          <t-col class="sendFile-button">
            <t-button theme="primary" @click="sendFileToDevice">发送</t-button>
          </t-col>
        </div>

        <div v-if="isTransferTextDialogVisible" class="root">
          <t-textarea
            v-model="textToTransfer"
            :autosize="{ minRows: 12, maxRow: 12 }"
            style="height: 50px"
            class="textareaBox"
            placeholder="请输入要传输的文本"
            :maxlength="5000"
          />
          <t-col class="sendFile-button">
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
import serviceApi from '@renderer/apis/service';
import { CloudUploadIcon } from 'tdesign-icons-vue-next';

import macAct from '../../assets/image/macAct.png';
import mac from '../../assets/image/mac.png';
import windows from '../../assets/image/windows.png';
import windowsAct from '../../assets/image/windowsAct.png';
import linuxAct from '../../assets/image/linuxAct.png';
import linux from '../../assets/image/linux.png';
import refreshAct from '../../assets/image/refreshAct.png';
import { useServiceInfo } from '@renderer/utils/store/service-info';
import { useSendController } from '@renderer/utils/store/send-controller';

const serviceInfo = useServiceInfo();
const sendController = useSendController();
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
  try {
    const result = await nativeApi.invoke.openFileDialog({
      title: '选择文件',
      buttonLabel: '选择',
      filters: [
        {
          name: 'All Files',
          extensions: ['*']
        }
      ],
      properties: {
        openFile: true,
        openDirectory: false,
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
      console.log('选择文件路径', selectedFilePaths);
    }
  } catch (error) {
    interact.message.error(`文件选择失败: ${error}`);
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

  selectedFilePaths.value = fileList;

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

// 发送文件到设备
async function sendFileToDevice() {
  if (selectedDevices.value.length === 0) {
    interact.message.error('请选择一个设备');
    return;
  }

  if (selectedFilePaths.value.length === 0) {
    interact.message.error('未选择任何文件');
    return;
  }

  for (const filePath of selectedFilePaths.value) {
    for (const deviceId of selectedDevices.value) {
      try {
        await sendController.sendFile(filePath, deviceId);
        interact.message.success('发送文件成功');
      } catch (err) {
        interact.message.error(`发送文件失败: ${err}`);
      }
    }
  }
}

const refreshNearbyDevices = async () => {
  refreshing.value = true;
  await initNearbyDevices();
  setTimeout(() => {
    refreshing.value = false;
  }, 1500);
};

// 刷新设备列表
const refreshing = ref(false);

const initNearbyDevices = async () => {
  try {
    const Devices = await serviceApi.invoke.getAvailableServices();
    const trustedDevices = await serviceApi.invoke.getVerifiedDevices();
    const tempDevices = Devices.map((item) => ({
      devname: item.name || '未知设备',
      devtype: 'mac', //这里需要返回设备类型
      devid: item.id || '',
      isSign: true,
      deviceTrust: trustedDevices.some((trusted) => trusted.id === item.id)
    }));
    serviceInfo.nearbyDevices = tempDevices;
    console.log('设备列表', tempDevices);
  } catch (err) {
    console.error('Failed to refresh nearby devices', err);
  }
};

onMounted(() => {
  initNearbyDevices();
});
</script>

<style scoped lang="scss" src="./index.scss"></style>

<template>
  <div class="root">
    <div class="row">
      <div style="flex-shrink: 0">设备名称：</div>
      <t-input v-model="serviceName" placeholder="未指定设备名称" :maxlength="15" />
      <t-button style="flex-shrink: 0" :disabled="serviceName.length === 0" @click="setServiceName">
        修改名称
      </t-button>
    </div>
    <div class="row">
      <div style="flex-shrink: 0">下载路径：</div>
      <t-input v-model="pathType" placeholder="请选择下载路径" disabled />
      <t-button style="flex-shrink: 0" @click="openFileDialog">修改路径</t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInfo } from '@renderer/utils/store/service-info';
import nativeApi from '@renderer/apis/native';
import interact from '@renderer/utils/interact';
import { ref, onMounted } from 'vue';

const serviceInfo = useServiceInfo();
const pathType = ref('downloads');
const serviceName = ref('');
// 获取目标目录路径
async function getTargetPath() {
  const localPath = localStorage.getItem('pathType');
  if (localPath) {
    pathType.value = localPath;
    return;
  }
  try {
    const path = await nativeApi.invoke.getPath('downloads');
    pathType.value = path;
  } catch (err) {
    console.log(err);
    interact.message.error(String(err));
  }
}

onMounted(async () => {
  getTargetPath();
  getServiceName();
});

// 修改设备名称
function setServiceName() {
  localStorage.setItem('serviceName', serviceName.value);
  serviceInfo.setServiceName(serviceName.value);
}

// 获取设备名称
async function getServiceName() {
  const localPath = localStorage.getItem('serviceName');
  if (localPath) {
    serviceName.value = localPath;
    serviceInfo.setServiceName(localPath);
    return;
  }
}

// 修改下载路径
async function openFileDialog() {
  try {
    const result = await nativeApi.invoke.openFileDialog({
      title: '选择文件夹',
      buttonLabel: '选择',
      filters: [],
      properties: {
        openFile: true,
        openDirectory: true,
        multiSelections: true
      }
    });

    if (!result || result.length === 0) {
      interact.message.warning('用户取消选择');
      return;
    }

    pathType.value = result[0];
    localStorage.setItem('pathType', result[0]);

    // 更新路径设置
    try {
      await nativeApi.invoke.getPath('downloads');
      interact.message.success('下载路径已更新');
    } catch (err) {
      interact.message.error(String(err));
    }
  } catch (error) {
    interact.message.error('打开文件夹对话框出错');
  }
}
</script>

<style lang="scss" scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.2rem;
  gap: 2rem;
  overflow-x: hidden;
  overflow-y: auto;

  .row {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0.6rem;
  }
}
</style>

<template>
  <div class="root">
    <div class="row">设备ID: {{ serviceId }}</div>
    <div class="row">
      <div style="flex-shrink: 0">设备名称：</div>
      <t-input v-model="serviceName" placeholder="未指定设备名称" />
      <t-button style="flex-shrink: 0" :disabled="serviceName.length === 0" @click="setServiceName">
        修改名称
      </t-button>
      <t-button style="flex-shrink: 0" theme="default" @click="getServiceName">获取名称</t-button>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import { PathType } from '@ipc/native';
import nativeApi from '@renderer/apis/native';
import serviceApi from '@renderer/apis/service';
import interact from '@renderer/utils/interact';
import { onMounted } from 'vue';
import { ref } from 'vue';

const pathType = ref('');
const serviceId = ref('');
const serviceName = ref('');

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
    interact.dialog({
      title: '选择文件',
      content: '用户取消选择'
    });
    return;
  }

  interact.dialog({
    title: '选择文件',
    content: result.length ? result.join(', ') : '未选择任何文件',
    cancelText: null
  });
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

// 修改设备名称
function setServiceName() {
  serviceApi.invoke
    .setName(serviceName.value)
    .then(() => {
      interact.message.success('设备名称修改成功');
    })
    .catch(async (err) => {
      interact.message.error(String(err));
      serviceName.value = await serviceApi.invoke.getName();
    });
}

// 获取设备名称
async function getServiceName() {
  serviceName.value = await serviceApi.invoke.getName();
}

onMounted(async () => {
  serviceId.value = await serviceApi.invoke.getId();
  getServiceName();
});
</script>

<style lang="scss" scoped>
.root {
  @include flex(column, flex-start, flex-start);
  @include size();
  @include padding();
  gap: 1.2rem;

  overflow-x: hidden;
  overflow-y: auto;

  .row {
    @include flex(row, flex-start, center);
    width: 100%;

    gap: 0.6rem;
  }
}
</style>

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
const dragOver = ref(false);

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

  console.log('拖拽文件路径', fileList);

  interact.notify.success({
    title: '文件拖拽',
    content: `文件拖拽成功，路径：${fileList.join(', ')}`
  });
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

  button {
    flex-shrink: 0;
  }

  overflow-x: hidden;
  overflow-y: auto;

  .row {
    @include flex(row, flex-start, center);
    width: 100%;

    gap: 0.6rem;
  }

  .drag-area {
    @include flex(column, center, center);
    width: 100%;
    flex: 1 0;

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

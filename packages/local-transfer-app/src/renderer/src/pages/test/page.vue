<template>
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
  </div>
</template>

<script setup lang="ts">
import { PathType } from '@ipc/native';
import nativeApi from '@renderer/apis/native';
import interact from '@renderer/utils/interact';
import { ref } from 'vue';

const pathType = ref('');

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
    content: result.length ? result.join(', ') : '未选择任何文件'
  });
}

// 获取目标目录路径
async function getTargetPath() {
  if (!pathType.value) {
    interact.message.error('请选择目录类型');
    return;
  }
  nativeApi.invoke
    .getPath(pathType.value as PathType)
    .then((path) => {
      interact.dialog({
        title: '目标路径',
        content: path
      });
    })
    .catch((err) => {
      console.log(err);
      interact.message.error(String(err));
    });
}
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

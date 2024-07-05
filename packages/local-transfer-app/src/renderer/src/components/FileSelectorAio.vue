<template>
  <div
    class="file-selector-aio"
    :class="{
      'drag-over': dragOver
    }"
    @click="clickHandler"
    @drop="handleDropFile"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    点击选择或将文件拖入
  </div>
</template>

<script setup lang="ts">
import nativeApi from '@renderer/apis/native';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
  }>(),
  {
    multiple: false
  }
);

const emit = defineEmits<{
  (e: 'select', paths: string[]): void;
}>();

const dragOver = ref(false);

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

  emit('select', fileList);
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

function clickHandler() {
  nativeApi.invoke
    .openFileDialog({
      title: '选择文件',
      properties: {
        openFile: true,
        openDirectory: false,
        multiSelections: props.multiple
      },
      filters: [
        {
          name: '所有文件',
          extensions: ['*']
        }
      ],
      buttonLabel: '选择'
    })
    .then((res) => {
      if (res && res.length) {
        emit('select', res);
      }
    });
}
</script>

<style scoped lang="scss">
.file-selector-aio {
  @include flex(row, center, center);
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.8rem;
  border: 3px dashed var(--td-border-level-1-color);
  color: var(--td-text-color-secondary);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #333;
    background-color: var(--td-bg-color-container-hover);
  }

  &.drag-over {
    border-color: var(--td-brand-color);
  }
}
</style>

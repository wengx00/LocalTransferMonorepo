<template>
  <div class="clip-board-item">
    {{ text }}
    <div class="clip-board-item_toolbar">
      <DeleteIcon class="delete" @click="emit('delete')" />
      <CopyIcon class="copy" @click="emit('copy', text)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyIcon, DeleteIcon } from 'tdesign-icons-vue-next';

defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  (e: 'delete'): void;
  (e: 'copy', text: string): void;
}>();
</script>

<style scoped lang="scss">
.clip-board-item {
  @include flex(column, flex-start, flex-start);
  @include padding(0.8rem);
  position: relative;
  white-space: wrap;
  width: 100%;
  height: fit-content;
  flex-shrink: 0;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  border: 2px solid var(--td-border-level-2-color);
  overflow: hidden;

  &_toolbar {
    @include flex(row, center, center);
    @include padding(0.4rem);
    position: absolute;
    gap: 0.8rem;
    top: 0.8rem;
    right: 0.8rem;
    color: var(--td-text-color-secondary);
    background: #fffa;
    backdrop-filter: blur(0.4rem);
    opacity: 0;
    transition: all 0.3s;

    .copy {
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        color: var(--td-brand-color);
      }
    }
    .delete {
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        color: var(--td-error-color);
      }
    }
  }

  &:hover {
    .clip-board-item_toolbar {
      opacity: 1;
    }
  }
}
</style>

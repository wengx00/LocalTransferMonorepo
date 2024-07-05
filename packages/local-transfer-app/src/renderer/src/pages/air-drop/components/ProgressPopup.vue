<template>
  <div class="progress-popup">
    <ProgressBar class="item" label="测试文件" :progress="30" :speed="570" :target-id="'123'" />
  </div>
</template>

<script setup lang="ts">
import ProgressBar from '@renderer/components/ProgressBar.vue';
</script>

<style scoped lang="scss">
.progress-popup {
  @include flex(column, flex-start, flex-start);
  @include size();
  flex-shrink: 0;
  overflow-x: hidden;
  overflow-y: auto;

  .item {
    @include padding(0.8rem 0.4rem);
    border-bottom: 1px solid var(--td-border-level-1-color);
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>

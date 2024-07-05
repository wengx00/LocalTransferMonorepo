<template>
  <div class="progress-popup">
    <ProgressBar
      v-for="item in sendController.taskList"
      :key="item.batchId"
      :label="item.filename"
      :progress="item.progress"
      :target-id="'1'"
      :speed="item.speed"
    />
  </div>
</template>

<script setup lang="ts">
import ProgressBar from '@renderer/components/ProgressBar.vue';
import { useSendController } from '@renderer/store/send-controller';

const sendController = useSendController();
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

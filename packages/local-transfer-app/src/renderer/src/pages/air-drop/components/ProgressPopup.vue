<template>
  <transition-group tag="div" class="progress-popup" name="list">
    <ProgressBar
      v-for="item in sendController.taskList"
      :key="item.batchId"
      :label="item.filename"
      :progress="item.progress"
      :target-id="item.targetId"
      :speed="item.speed"
    />
    <EmptyList
      v-if="sendController.taskList.length === 0"
      title="暂无发送任务"
      :img="EmptyTaskImage"
    />
  </transition-group>
</template>

<script setup lang="ts">
import EmptyList from '@renderer/components/EmptyList.vue';
import ProgressBar from '@renderer/components/ProgressBar.vue';
import EmptyTaskImage from '@assets/image/Empty-Box.png';
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

<template>
  <transition-group tag="div" class="progress-popup" name="list">
    <ProgressBar
      v-for="item in sendController.taskList"
      :key="item.batchId"
      :label="item.filename"
      :progress="item.progress"
      :target-id="item.targetId"
      :speed="item.speed"
    >
      <template #postfix>
        <CloseIcon class="close-btn" @click="triggerCloseTask(item.batchId)" />
      </template>
    </ProgressBar>
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
import { CloseIcon } from 'tdesign-icons-vue-next';
import interact from '@renderer/utils/interact';

const sendController = useSendController();

function triggerCloseTask(taskId: string) {
  interact.dialog({
    title: '取消投送',
    content: '确认要取消投送吗？该操作无法撤销',
    onConfirm() {
      sendController.cancelTask(taskId);
    },
    confirmText: '终止投送',
    cancelText: '继续投送'
  });
}
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

  .close-btn {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: var(--td-brand-color);
    }
  }
}
</style>

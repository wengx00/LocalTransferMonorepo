<template>
  <div class="progress-bar">
    <div class="progress-bar_label">{{ label }}</div>
    <div class="progress-bar_progress">
      <div
        class="progress-bar_progress_done"
        :style="{
          width: `${progress}%`
        }"
      ></div>
    </div>
    <div class="progress-bar_info">
      <div class="progress-bar_info_target">{{ targetName }}</div>
      <div v-if="speed !== undefined" class="progress-bar_info_speed">
        速度：{{ speed || 0 }} MB/s
      </div>
      <div class="progress-bar_percent">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceInfo } from '@renderer/store/service-info';
import { computed } from 'vue';

const serviceInfo = useServiceInfo();

const props = withDefaults(
  defineProps<{
    label: string;
    targetId: string;
    progress?: number;
    speed?: number;
  }>(),
  {
    progress: 0
  }
);

const targetName = computed(
  () => serviceInfo.availableServices.find(({ id }) => id === props.targetId)?.name || '未知设备'
);
</script>

<style scoped lang="scss">
.progress-bar {
  @include flex(column, flex-start, flex-start);
  flex-shrink: 0;
  width: 100%;
  gap: 0.1rem;
  overflow: hidden;

  &_label {
    width: 100%;
    font-size: 1.4rem;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &_progress {
    @include flex(row, flex-start, center);
    width: 100%;
    height: 0.4rem;
    border-radius: 10rem;
    background: #f1f1f1;
    overflow: hidden;
    transition: all 0.3s;
    border-radius: 10rem;

    &_done {
      height: 100%;
      background: var(--td-brand-color);
      border-radius: 10rem;
    }
  }

  &_info {
    @include flex(row, space-between, center);
    width: 100%;
    font-size: 1.2rem;
    color: var(--td-text-color-secondary);
    gap: 0.4rem;

    &_target {
      flex: 1 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &_speed,
    &_percent {
      flex-shrink: 0;
    }
  }
}
</style>

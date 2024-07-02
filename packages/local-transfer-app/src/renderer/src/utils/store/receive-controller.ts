import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface ReceiveTask {
  batchId: string;
  progress: number;
  speed: number;
  size: number;
  filename: string;
  sourceServiceName: string;
}

export const useReceiveController = defineStore('receive-controller', () => {
  // 任务map，O(1) 查询效率
  const taskMap = ref(new Map<string, ReceiveTask>());

  // 任务列表
  const taskList = computed(() => taskMap.value.values());

  return {
    taskList
  };
});

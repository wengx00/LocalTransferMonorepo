import serviceApi from '@renderer/apis/service';
import { SendFileException, TransferInfo } from 'local-transfer-service';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import interact from '../interact';

export interface SendTask {
  batchId: string;
  progress: number; // 单位 %
  speed: number; // 单位 KB/s
  size: number; // 单位 B
  filename: string;
  targetServiceName: string; // 目标设备别名
}

export const useSendController = defineStore('send-controller', () => {
  // 任务map，O(1) 查询效率
  const taskMap = ref(new Map<string, SendTask>());

  // 任务列表
  const taskList = computed(() => taskMap.value.values());

  function onLaunchHandler({ filename, batchId, size }: TransferInfo) {
    if (taskMap.value.has(batchId)) {
      // 重复 Launch？这是个么得可能的情况
      return;
    }
    taskMap.value.set(batchId, {
      batchId,
      filename,
      size,
      progress: 0,
      speed: 0,
      // TODO: ServiceApi 需要支持
      targetServiceName: ''
    });
  }

  function onProgressHandler({
    batchId,
    progress,
    speed
  }: TransferInfo & { progress: number; speed: number }) {
    const record = taskMap.value.get(batchId);
    if (!record) {
      // 么得可能的情况
      return;
    }
    // 更新进度和速度
    taskMap.value.set(batchId, {
      ...record,
      speed,
      progress
    });
  }

  async function sendFile(path: string, targetId: string) {
    try {
      const result = await serviceApi.invoke.sendFile({
        path,
        targetId,
        onLaunch: onLaunchHandler,
        onProgress: onProgressHandler
      });
      const { batchId, filename, cost } = result;
      interact.notify.success({
        title: '发送成功',
        content: `${filename}发送成功，耗时：${cost}s`
      });
      // 无论成功失败都直接删除记录
      taskMap.value.delete(batchId);
    } catch (err) {
      const { filename, reason, batchId } = err as SendFileException;
      interact.notify.error({
        title: '发送失败',
        content: `${filename}发送失败，错误信息：${reason}`
      });
      // 无论成功失败都直接删除记录
      taskMap.value.delete(batchId);
    }
  }

  return {
    taskList,

    sendFile
  };
});

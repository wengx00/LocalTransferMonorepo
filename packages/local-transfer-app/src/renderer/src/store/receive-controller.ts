import serviceApi from '@renderer/apis/service';
import { ReceiveFileHandler } from 'local-transfer-service';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import interact from '../utils/interact';

export interface ReceiveTask {
  batchId: string;
  progress: number;
  speed: number;
  size: number;
  filename: string;
  sourceId: string;
  // 过期时间
  expireAfter: number;
}

// 默认过期时间：1min
const taskTtl = 60 * 1000;

export const useReceiveController = defineStore('receive-controller', () => {
  let initialized = false;
  let timer: number | null = null;
  // 任务map，O(1) 查询效率
  const taskMap = ref(new Map<string, ReceiveTask>());

  // 任务列表
  const taskList = computed(() => Array.from(taskMap.value.values()));
  // 接收剪贴板
  const clipboard = ref<string[]>([]);

  // 接收文件处理器
  const receiveFileHandler: ReceiveFileHandler = async (context, error) => {
    const { batchId, speed, progress, size, filename, sourceId, done } = context;
    if (error) {
      interact.notify.error({
        title: '接收文件失败',
        content: `接收 ${filename} 失败，错误信息：${error}`
      });
      // 出错时把记录删了
      taskMap.value.delete(batchId);
      return;
    }
    console.log('接收文件 onProgress...', context);
    if (done) {
      interact.notify.success({
        title: '接收文件成功',
        content: `${filename} 接收成功`
      });
      // 成功时把记录删了
      taskMap.value.delete(batchId);
      return;
    }
    let record: ReceiveTask | undefined = taskMap.value.get(batchId);
    if (!record) {
      record = {
        batchId,
        // 防止跳变，不保留小数点
        progress: Number(progress.toFixed(0)),
        speed,
        size,
        filename,
        sourceId,
        expireAfter: +new Date() + taskTtl
      };
      // 新增记录
      taskMap.value.set(batchId, record);
      return;
    }
    // 已存在记录，更新记录
    taskMap.value.set(batchId, {
      ...record,
      speed,
      progress: Number(progress.toFixed(0)),
      expireAfter: +new Date() + taskTtl // 刷新 TTL
    });
  };

  // 定时清理过期任务
  const clearHandler = () => {
    const now = +new Date();
    taskMap.value.forEach((record) => {
      if (record.expireAfter < now) {
        interact.notify.error({
          title: '任务过期',
          content: `接收 ${record.filename} 超时`
        });
        taskMap.value.delete(record.batchId);
      }
    });
  };

  // 初始化监听器，只在 App 初始化时执行
  function initialize() {
    if (!initialized) {
      initialized = true;
      serviceApi.listener.receiveFile(receiveFileHandler);
      serviceApi.listener.receiveText((context) => {
        clipboard.value.push(context.text);
      });
      // 注册清理任务，每30s执行一次
      timer = setInterval(clearHandler, 30 * 1000) as any;
    }
  }

  // 析构
  function dispose() {
    if (timer) {
      clearInterval(timer);
    }
  }

  // 删除剪贴板的某一项
  function removeClipboardItem(index: number) {
    clipboard.value.splice(index, 1);
  }

  return {
    taskList,
    clipboard,

    initialize,
    dispose,
    removeClipboardItem
  };
});

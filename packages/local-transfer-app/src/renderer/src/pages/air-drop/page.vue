<template>
  <div class="container">
    <div class="title-bar">
      <PageHeader style="flex: 1 0" title="隔空投送" />
      <div class="row">
        <t-button variant="outline" style="flex-shrink: 0" @click="toggleVision">
          切换{{ currentVision === 'file' ? '文本' : '文件' }}模式
        </t-button>
        <t-button shape="circle" style="flex-shrink: 0" @click="toggleProgressPopup">
          <template #icon>
            <RocketIcon />
          </template>
        </t-button>
      </div>
    </div>
    <div class="airdrop-aio">
      <SectionCard class="services-root">
        <template #title>
          <div class="header">
            设备列表
            <RefreshIcon
              class="refresh"
              :class="{
                spin: refreshSpin
              }"
              @click="refresh"
            />
          </div>
        </template>
        <transition-group name="list" tag="div" class="list">
          <ListTile v-for="item in serviceList" :key="item.id">
            <div class="content-primary">
              <t-checkbox v-model="item.selected" class="checkbox" />
              <div class="name">{{ item.name }}</div>
            </div>
            <template #secondary> {{ item.ip }} on {{ item.port }} </template>
          </ListTile>
        </transition-group>
        <EmptyList v-if="serviceList.length === 0" title="暂无可用设备" />
      </SectionCard>
      <SectionCard v-if="currentVision === 'file'" class="files-root">
        <template #title>
          <div class="header">
            投送文件
            <t-button :disabled="filePaths.length === 0" @click="airdrop('file')">
              <template #icon>
                <CloudUploadIcon />
              </template>
              AirDrop
            </t-button>
          </div>
        </template>
        <FileSelectorAio multiple style="height: 20rem" @select="selectFile" />
        <div class="content">
          <t-popup v-for="(item, index) in filePaths" :key="item" :content="item">
            <div class="selected">
              <div class="filename">
                {{ item }}
              </div>
              <CloseIcon class="close" @click="cancelFile(index)" />
            </div>
          </t-popup>
        </div>
      </SectionCard>
      <SectionCard v-else class="files-root">
        <template #title>
          <div class="header">
            投送文本
            <t-button :disabled="text.length === 0" @click="airdrop('text')">
              <template #icon>
                <CloudUploadIcon />
              </template>
              AirDrop
            </t-button>
          </div>
        </template>
        <div class="content">
          <t-textarea
            v-model="text"
            placeholder="请输入要投送的文本内容"
            clearable
            :autosize="{
              minRows: 3,
              maxRows: 15
            }"
          />
        </div>
      </SectionCard>
    </div>
    <t-drawer
      v-model:visible="progressPopup"
      :confirm-btn="null"
      cancel-btn="关闭"
      destroy-on-close
      size="50%"
      header="投送进度"
    >
      <ProgressPopup />
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
import EmptyList from '@renderer/components/EmptyList.vue';
import FileSelectorAio from '@renderer/components/FileSelectorAio.vue';
import ListTile from '@renderer/components/ListTile.vue';
import PageHeader from '@renderer/components/PageHeader.vue';
import SectionCard from '@renderer/components/SectionCard.vue';
import { useSendController } from '@renderer/store/send-controller';
import interact from '@renderer/utils/interact';
import { useServiceInfo } from '@store/service-info';
import { ServiceInfo } from 'local-transfer-service';
import { storeToRefs } from 'pinia';
import { CloseIcon, CloudUploadIcon, RefreshIcon, RocketIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';
import ProgressPopup from './components/ProgressPopup.vue';

const serviceInfo = useServiceInfo();
const serviceInfoStoreRefs = storeToRefs(serviceInfo);
const sendController = useSendController();
// 选中的文件路径
const filePaths = ref<string[]>([]);

// 刷新中
const refreshSpin = ref(false);
// 显示进度弹框
const progressPopup = ref(false);
// 当前视图
const currentVision = ref<'file' | 'text'>('file');
// 文本内容
const text = ref('');

// 设备列表
const serviceList = ref<Array<ServiceInfo & { selected?: boolean }>>(serviceInfo.availableServices);

watch(serviceInfoStoreRefs.availableServices, () => {
  const curSelectedSet = new Set(
    serviceList.value.filter((item) => item.selected).map(({ id }) => id)
  );
  serviceList.value = serviceInfo.availableServices.map((item) => ({
    ...item,
    selected: curSelectedSet.has(item.id)
  }));
});

// 刷新可用设备
async function refresh() {
  if (refreshSpin.value) {
    return;
  }
  refreshSpin.value = true;
  setTimeout(() => {
    refreshSpin.value = false;
  }, 500);
  serviceInfo.refreshServices();
}

// 选择文件
function selectFile(paths: string[]) {
  const curPaths = new Set(filePaths.value);
  for (const path of paths) {
    if (!curPaths.has(path)) {
      curPaths.add(path);
    }
  }
  filePaths.value = Array.from(curPaths);
}

// 取消选择文件
function cancelFile(index: number) {
  filePaths.value.splice(index, 1);
}

// 打开进度抽屉
function toggleProgressPopup() {
  progressPopup.value = !progressPopup.value;
}

// 隔空投送
function airdrop(type: 'file' | 'text') {
  const targetIds = serviceList.value.filter((item) => item.selected).map(({ id }) => id);
  if (targetIds.length === 0) {
    interact.message.warning('请选择投送设备');
    return;
  }
  if (type === 'file' && filePaths.value.length === 0) {
    interact.message.warning('请选择要投送的文件');
    return;
  }
  if (type === 'text' && text.value.length === 0) {
    interact.message.warning('请输入要投送的文本内容');
    return;
  }
  if (type === 'file') {
    filePaths.value.forEach((filePath) => {
      targetIds.forEach((id) => {
        sendController.sendFile(filePath, id);
      });
    });
    // 清空选中的文件
    filePaths.value = [];
    interact.message.success('开始隔空投送，可在“火箭🚀面板”查看进度');
    return;
  }
  // 发送文本
  targetIds.forEach((id) => {
    sendController.sendText(text.value, id);
  });
  interact.message.success('开始隔空投送文本🚀');
}

// 切换视图
function toggleVision() {
  currentVision.value = currentVision.value === 'file' ? 'text' : 'file';
}
</script>

<style scoped lang="scss" src="./index.scss"></style>

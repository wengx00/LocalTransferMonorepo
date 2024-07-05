<template>
  <div class="container">
    <div class="title-bar">
      <PageHeader style="flex: 1 0" title="隔空投送" />
      <t-button shape="circle" style="flex-shrink: 0" @click="toggleProgressPopup">
        <template #icon>
          <RocketIcon />
        </template>
      </t-button>
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
        <transition-group name="list">
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
      <SectionCard class="files-root">
        <template #title>
          <div class="header">
            投送文件
            <t-button :disabled="filePaths.length === 0" @click="airdrop">
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
import serviceApi from '@renderer/apis/service';
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
import ProgressPopup from './components/ProgressPopup.vue';
import { watch } from 'vue';
import { ref } from 'vue';
import EmptyList from '@renderer/components/EmptyList.vue';

const serviceInfo = useServiceInfo();
const serviceInfoStoreRefs = storeToRefs(serviceInfo);
const sendController = useSendController();
const filePaths = ref<string[]>([]);

const refreshSpin = ref(false);
const progressPopup = ref(false);

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
  try {
    await serviceApi.invoke.refresh();
    interact.message.success('设备列表刷新成功');
  } catch {
    interact.message.error('设备列表刷新失败，请稍后重试');
  }
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
function airdrop() {
  const targetIds = serviceList.value.filter((item) => item.selected).map(({ id }) => id);
  if (targetIds.length === 0) {
    interact.message.warning('请选择投送设备');
    return;
  }
  filePaths.value.forEach((filePath) => {
    targetIds.forEach((id) => {
      sendController.sendFile(filePath, id);
    });
  });
  // 清空选中的文件
  filePaths.value = [];
  interact.dialog({
    title: '开始隔空投送',
    content: '投送进度可在“火箭🚀面板”查看'
  });
}
</script>

<style scoped lang="scss" src="./index.scss"></style>

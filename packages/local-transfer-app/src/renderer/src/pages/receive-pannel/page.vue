<template>
  <div class="container">
    <PageHeader title="接收面板" />
    <div class="receive-aio">
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
        <EmptyList v-if="serviceList.length === 0" title="暂无可用设备" />
        <transition-group v-else name="list" tag="div" class="content">
          <ListTile v-for="(item, index) in serviceList" :key="item.id">
            <div class="content-primary">
              <div class="name">{{ item.name }}</div>
              <t-button
                variant="outline"
                :theme="item.verified ? 'success' : 'warning'"
                size="small"
                @click="toggleAuthorization(index)"
                >{{ item.verified ? '已信任' : '未信任' }}</t-button
              >
            </div>
            <template #secondary> {{ item.ip }} on {{ item.port }} </template>
          </ListTile>
        </transition-group>
      </SectionCard>
      <SectionCard class="files-root">
        <template #title>
          <div class="header">
            <div>{{ visionTitle }}</div>
            <t-button @click="switchVision">
              <template #icon>
                <FaceRetouchingIcon />
              </template>
              切换
            </t-button>
          </div>
        </template>
        <template v-if="currentVision === 'file'">
          <transition-group name="list" tag="div" class="content">
            <ProgressBar
              v-for="item in receiveController.taskList"
              :key="item.batchId"
              class="item"
              :label="item.filename"
              :progress="item.progress"
              :target-id="'1'"
            />
          </transition-group>
        </template>
        <template v-else>
          <transition-group name="list" tag="div" class="content">
            <ClipBoardItem
              v-for="(item, index) in clipboard"
              :key="item"
              :text="item"
              @copy="writeClipboard"
              @delete="receiveController.removeClipboardItem(index)"
            />
          </transition-group>
        </template>
        <EmptyList
          v-if="
            (currentVision === 'file' && receiveController.taskList.length === 0) ||
            (currentVision === 'text' && clipboard.length === 0)
          "
          style="width: 70%"
          :title="emptyTitle"
          :img="EmptyTaskListImage"
        />
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import serviceApi from '@renderer/apis/service';
import EmptyList from '@renderer/components/EmptyList.vue';
import PageHeader from '@renderer/components/PageHeader.vue';
import ProgressBar from '@renderer/components/ProgressBar.vue';
import SectionCard from '@renderer/components/SectionCard.vue';
import ClipBoardItem from './components/ClipBoardItem.vue';
import { useReceiveController } from '@renderer/store/receive-controller';
import { useServiceInfo } from '@renderer/store/service-info';
import interact from '@renderer/utils/interact';
import { ServiceInfo } from 'local-transfer-service';
import { storeToRefs } from 'pinia';
import { FaceRetouchingIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { ref, watch } from 'vue';

import EmptyTaskListImage from '@assets/image/Empty-Box.png';
import { computed } from 'vue';
import nativeApi from '@renderer/apis/native';
import ListTile from '@renderer/components/ListTile.vue';
import { onMounted } from 'vue';

const serviceInfo = useServiceInfo();
const serviceInfoStoreRefs = storeToRefs(serviceInfo);
const receiveController = useReceiveController();

const serviceList = ref<Array<ServiceInfo & { verified?: boolean }>>(serviceInfo.availableServices);
const refreshSpin = ref(false);
const currentVision = ref<'file' | 'text'>('file');
const clipboard = ref<string[]>([]);

const visionTitle = computed(() => (currentVision.value === 'file' ? '接收进度' : '粘贴板'));
const emptyTitle = computed(() =>
  currentVision.value === 'file' ? '暂无接收任务' : '粘贴板空空如也'
);

// 重新设置 ServiceList
function updateServiceList() {
  const { availableServices, verifiedServices } = serviceInfo;
  const verifiedSet = new Set(verifiedServices.map(({ id }) => id));
  serviceList.value = availableServices.map((service) => ({
    ...service,
    verified: verifiedSet.has(service.id)
  }));
  console.log('updateServiceList', serviceList.value);
}

// 切换视图
function switchVision() {
  currentVision.value = currentVision.value === 'file' ? 'text' : 'file';
}

// 刷新设备
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

// 切换授权
async function toggleAuthorization(index: number) {
  const target = serviceList.value[index];
  if (target.verified) {
    serviceInfo.unauthorize(target.id);
  } else {
    serviceInfo.authorize(target.id);
  }
}

// 写入粘贴板
async function writeClipboard(text: string) {
  try {
    await nativeApi.invoke.writeClipboard(text);
    interact.message.success('写入剪贴板成功');
  } catch (err) {
    console.log(err);
    interact.message.error('无法写入剪贴板，请检查权限');
  }
}

watch([serviceInfoStoreRefs.availableServices, serviceInfoStoreRefs.verifiedServices], () => {
  updateServiceList();
});

onMounted(() => {
  updateServiceList();
});
</script>

<style scoped lang="scss" src="./index.scss"></style>

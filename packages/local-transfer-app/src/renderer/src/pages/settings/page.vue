<template>
  <div class="container">
    <PageHeader title="系统设置" />
    <SectionCard>
      <template #title>设备信息</template>
      <ListTile direction="row" gap="1rem">
        设备别名
        <template #secondary>
          <t-input v-model="serviceName" borderless placeholder="请输入设备别名" />
        </template>
      </ListTile>
      <ListTile direction="row" gap="1rem">
        下载目录
        <template #secondary>
          <t-input
            v-model="downloadRoot"
            readonly
            borderless
            placeholder="请选择下载根目录"
            @click="chooseDownloadRootHandler"
          />
        </template>
      </ListTile>
      <ListTile direction="row" gap="1rem">
        协议端口
        <template #secondary>
          <t-input
            readonly
            :value="serviceInfo.tcpPort"
            borderless
            placeholder="使用默认端口"
            @click="changeTcpPortHandler"
          />
        </template>
      </ListTile>
      <div class="apply-bar">
        <t-button :disabled="!enableApply" @click="applySettingsHandler">应用更改</t-button>
      </div>
    </SectionCard>
    <SectionCard>
      <template #title>版本信息</template>
      <Versions />
    </SectionCard>
    <SectionCard>
      <template #title>开发调试</template>
      <ListTile direction="row" gap="1rem">
        开启 e2e 调试（更详细的日志）
        <template #secondary>
          <t-switch v-model="enableE2E" />
        </template>
      </ListTile>
      <ListTile direction="row" gap="1rem">
        Contributors
        <template #secondary>
          {{ constants.contributor }}
        </template>
      </ListTile>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import nativeApi from '@renderer/apis/native';
import ListTile from '@renderer/components/ListTile.vue';
import PageHeader from '@renderer/components/PageHeader.vue';
import SectionCard from '@renderer/components/SectionCard.vue';
import Versions from '@renderer/components/Versions.vue';
import constants from '@renderer/utils/constants';
import interact from '@renderer/utils/interact';
import { useServiceInfo } from '@store/service-info';
import { onMounted } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';

const serviceInfo = useServiceInfo();

const serviceName = ref(serviceInfo.serviceName);
const downloadRoot = ref(serviceInfo.downloadRoot);
const enableE2E = ref();

// 允许应用更改（有更改项时）
const enableApply = computed(
  () =>
    serviceName.value !== serviceInfo.serviceName || downloadRoot.value !== serviceInfo.downloadRoot
);

watch(enableE2E, async (value, oldValue) => {
  if (oldValue === undefined) {
    // 初始化，无需提示
    return;
  }
  try {
    if (value) {
      await nativeApi.invoke.setRuntime('e2e');
    } else {
      await nativeApi.invoke.setRuntime('production');
    }
    interact.message.success('切换运行时成功');
  } catch {
    interact.message.error('切换运行时失败，请稍后重试');
  }
});

onMounted(async () => {
  const runtime = await nativeApi.invoke.getRuntime();
  console.log('Current Runtime', runtime);
  enableE2E.value = runtime === 'e2e';
});

// 选择下载根目录
function chooseDownloadRootHandler() {
  nativeApi.invoke
    .openFileDialog({
      title: '选择下载根目录',
      buttonLabel: '选择',
      defaultPath: downloadRoot.value,
      properties: {
        openFile: false,
        openDirectory: true,
        multiSelections: false
      }
    })
    .then((res) => {
      if (!res || res.length === 0) {
        return;
      }
      downloadRoot.value = res[0];
    });
}

// 更改 TCP 端口
function changeTcpPortHandler() {
  interact.notify.info({
    title: '提示',
    content: '暂不支持修改端口'
  });
}

// 应用更改
async function applySettingsHandler() {
  try {
    if (serviceName.value !== serviceInfo.serviceName) {
      await serviceInfo.setServiceName(serviceName.value);
    }
    await serviceInfo.setDownloadRoot(downloadRoot.value);
    interact.message.success('应用设置成功');
  } catch (err) {
    console.log('applySettingsHandler:error', err);
    interact.message.error('应用设置失败');
  }
}
</script>

<style scoped lang="scss">
.container {
  @include flex(column, flex-start, flex-start);
  @include size();
  @include padding(1.2rem);
  flex-shrink: 0;
  overflow-y: auto;
  gap: 1.2rem;
}

.apply-bar {
  @include flex(row, flex-end, center);
  @include padding(0.8rem);
  width: 100%;
  flex-shrink: 0;
}
</style>

<template>
  <div class="app">
    <t-menu
      :value="appConfig.currentMenuValue"
      theme="light"
      class="sidebar"
      @change="appConfig.setCurrentMenuValue"
    >
      <template #logo>
        <div>{{ constants.appTitle }}</div>
      </template>
      <t-menu-item value="receive-file">
        <template #icon>
          <t-icon name="file-download" />
        </template>
        <p class="text">接收文件</p>
      </t-menu-item>
      <t-menu-item value="send-file">
        <template #icon>
          <t-icon name="file-import" />
        </template>
        <p class="text">发送文件</p>
      </t-menu-item>
      <t-menu-item value="settings">
        <template #icon>
          <t-icon name="system-setting" />
        </template>
        <p class="text">系统设置</p>
      </t-menu-item>
    </t-menu>
    <div class="body">
      <div class="header">
        <div class="current-device">
          <div style="width: 30%">设备ID: {{ serviceId }}</div>
          <div>设备名称：{{ serviceName }}</div>
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
      <div class="footer">
        Copyright @ 2024-{{ new Date().getFullYear() }} LocalTransfer. All Rights Reserved
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import serviceApi from '@renderer/apis/service';
import { onMounted, ref } from 'vue';

import constants from '@renderer/utils/constants';
import { useAppConfig } from '@utils/store/app-config';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const appConfig = useAppConfig();
const router = useRouter();

const serviceId = ref('');
const serviceName = ref('');
async function getServiceName() {
  serviceName.value = await serviceApi.invoke.getName();
}

onMounted(async () => {
  // 初始化 Menu 值
  appConfig.setCurrentMenuValue('settings');
  serviceId.value = await serviceApi.invoke.getId();
  await getServiceName();
});

watch(storeToRefs(appConfig).currentMenuValue, () => {
  router.push({
    path: appConfig.currentMenuValue as string
  });
});
</script>

<style lang="scss" scoped>
.app {
  @include flex(row, flex-start, flex-start);
  @include size();
  overflow: hidden;
}

.sidebar {
  width: 20rem;
  height: 100%;
  background-color: rgb(240, 243, 248);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  overflow-y: auto;
}

.body {
  @include flex(column, flex-start, flex-start);
  flex: 1 0;
  height: 100%;
  overflow: hidden;
}

.header {
  @include padding(1.4rem);
  width: 100%;
  flex-shrink: 0;
  border-bottom: 1px solid #ccc;
}

.current-device {
  display: flex;
  font-size: 18px;
  font-weight: 700;
}

.text {
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1 0;
  width: 100%;
  background-color: white;
}

.footer {
  @include flex(row, center, center);
  @include padding();
  flex-shrink: 0;
  width: 100%;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
  color: #ccc;
}
</style>

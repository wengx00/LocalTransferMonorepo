<template>
  <t-layout class="app">
    <t-aside width="240px">
      <t-menu v-model="selectedMenu" theme="light" class="sidebar">
        <template #logo>
          <div>LocalTransfer</div>
        </template>
        <t-menu-item value="ReceiveFile">
          <template #icon>
            <t-icon name="file-download" />
          </template>
          <p class="text">接收文件</p>
        </t-menu-item>
        <t-menu-item value="SendFile">
          <template #icon>
            <t-icon name="file-import" />
          </template>
          <p class="text">发送文件</p>
        </t-menu-item>
        <t-menu-item value="Settings">
          <template #icon>
            <t-icon name="system-setting" />
          </template>
          <p class="text">系统设置</p>
        </t-menu-item>
      </t-menu>
    </t-aside>
    <t-layout style="width: 600px">
      <t-header class="header">
        <div class="current-device">
          <div style="width: 30%">设备ID: {{ serviceId }}</div>
          <div>设备名称：{{ serviceName }}</div>
        </div>
      </t-header>
      <t-content class="content">
        <component :is="currentComponent" />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ReceiveFile from './ReceiveFile/ReceiveFile.vue';
import SendFile from './SendFile/SendFile.vue';
import Settings from './Settings/Settings.vue';
import serviceApi from '@renderer/apis/service';

const serviceId = ref('');
const serviceName = ref('');
const selectedMenu = ref('ReceiveFile');
const components = {
  ReceiveFile,
  SendFile,
  Settings
};
async function getServiceName() {
  serviceName.value = await serviceApi.invoke.getName();
}

onMounted(async () => {
  serviceId.value = await serviceApi.invoke.getId();
  await getServiceName();
});
const currentComponent = computed(() => components[selectedMenu.value]);
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar {
  background-color: rgb(240, 243, 248);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.header {
  padding: 10px;
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
  background-color: white;
  flex: 1;
}
</style>

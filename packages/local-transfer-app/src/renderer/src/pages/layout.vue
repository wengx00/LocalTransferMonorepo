<template>
  <div class="app">
    <t-menu
      :value="appConfig.currentMenuValue"
      theme="light"
      class="sidebar"
      @change="appConfig.setCurrentMenuValue"
    >
      <ListTile class="title-bar">
        <span class="title">
          {{ constants.appTitle }}
        </span>
        <template #secondary>
          {{ constants.appSlogan }}
        </template>
      </ListTile>
      <t-menu-item value="receive-pannel">
        <template #icon>
          <DashboardIcon />
        </template>
        接收面板
      </t-menu-item>
      <t-menu-item value="air-drop">
        <template #icon>
          <SendIcon />
        </template>
        隔空投送
      </t-menu-item>
      <t-menu-item value="settings">
        <template #icon>
          <SettingIcon />
        </template>
        系统设置
      </t-menu-item>
    </t-menu>
    <div class="body">
      <div class="header">
        <div class="current-device">
          <div>当前设备：{{ serviceInfo.serviceName ?? '未知设备' }}</div>
        </div>
      </div>
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition>
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      <div class="footer">
        Copyright &copy; {{ constants.appTitle }} {{ new Date().getFullYear() }}. All Rights
        Reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListTile from '@renderer/components/ListTile.vue';
import constants from '@renderer/utils/constants';
import { useServiceInfo } from '@store/service-info';
import { useAppConfig } from '@store/app-config';
import { storeToRefs } from 'pinia';
import { DashboardIcon, SendIcon, SettingIcon } from 'tdesign-icons-vue-next';
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const appConfig = useAppConfig();
const serviceInfo = useServiceInfo();
const router = useRouter();

onMounted(async () => {
  // 初始化 Menu 值
  appConfig.setCurrentMenuValue('settings');
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
  background: #f7f7f7;
}

.title-bar {
  margin-bottom: 1.6rem;

  .title {
    font-size: 1.7rem;
    color: var(--td-text-color-brand);
    font-weight: 700;
  }
}

.sidebar {
  width: 20rem;
  height: 100%;
  background-color: #fff;
  overflow-y: auto;
  box-shadow: 0px 3px 10px 0px rgba(0, 0, 0, 0.1);
}

.body {
  @include flex(column, flex-start, flex-start);
  flex: 1 0;
  height: 100%;
  overflow: hidden;
}

.header {
  @include padding(1rem);
  width: 100%;
  flex-shrink: 0;
  border-bottom: 1px solid #ddd;
}

.current-device {
  display: flex;
  font-size: 1.6rem;
  color: var(--td-text-color-secondary);
}

.content {
  flex: 1 0;
  width: 100%;
  overflow: hidden;
}

.footer {
  @include flex(row, center, center);
  @include padding(0.8rem);
  flex-shrink: 0;
  width: 100%;
  border-top: 1px solid #ddd;
  font-size: 1.4rem;
  color: var(--td-text-color-placeholder);
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

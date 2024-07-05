import { useAppConfig } from '@store/app-config';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './utils/router';
import debounce from './utils/tools/debounce';
// 全量引入TDesign，本地包无需担心产物大小
import TDesign from 'tdesign-vue-next';
// import 'tdesign-vue-next/es/style/index.css';
import '@assets/styles/reset.scss';
import '@assets/styles/theme.css';
import { useReceiveController } from '@store/receive-controller';
import { useServiceInfo } from '@store/service-info';

const pinia = createPinia();

createApp(App).use(pinia).use(router).use(TDesign).mount('#app');

const appConfig = useAppConfig();
const serviceInfo = useServiceInfo();
const receiveController = useReceiveController();

serviceInfo.initInfo();
receiveController.initialize();

window.addEventListener('beforeunload', () => {
  receiveController.dispose();
  // serviceApi.invoke.dispose();
});

// 窗口调整时更新屏幕信息
window.addEventListener(
  'resize',
  debounce(() => {
    appConfig.updateWindowSize();
  })
);

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './utils/router';
import { useAppConfig } from './utils/store/app-config';
import debounce from './utils/tools/debounce';
// 全量引入TDesign，本地包无需担心产物大小
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';

const pinia = createPinia();

createApp(App).use(pinia).use(router).use(TDesign).mount('#app');

const appConfig = useAppConfig();

// 窗口调整时更新屏幕信息
window.addEventListener(
  'resize',
  debounce(() => {
    appConfig.updateWindowSize();
  })
);

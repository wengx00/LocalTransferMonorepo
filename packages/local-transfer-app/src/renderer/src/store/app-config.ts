import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import constants from '../utils/constants';

export const useAppConfig = defineStore('app-config', () => {
  // 窗口大小
  const windowSize = ref({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // 移动端布局
  const enableMobileLayout = computed(
    () => windowSize.value.width <= constants.mobileLayoutBreakpoint
  );
  // 是否展开Menu
  const expandMenu = ref(true);
  // Menu的当前值
  const currentMenuValue = ref<string>('');

  // 更新窗口大小
  function updateWindowSize() {
    windowSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    console.log('updateWindowSize: ', windowSize.value);
  }

  // 展开/折叠Menu
  function setExpandMenu(value: boolean) {
    expandMenu.value = value;
  }
  function toggleMenuStatus() {
    expandMenu.value = !expandMenu.value;
  }

  // 设置Menu当前值
  function setCurrentMenuValue(value: string) {
    currentMenuValue.value = value;
  }

  return {
    windowSize,
    enableMobileLayout,
    expandMenu,
    currentMenuValue,

    updateWindowSize,
    setExpandMenu,
    toggleMenuStatus,
    setCurrentMenuValue
  };
});

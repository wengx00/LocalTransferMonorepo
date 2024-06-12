import { DialogPlugin, MessagePlugin, NotifyPlugin } from 'tdesign-vue-next';

export type MessageThemeList = 'info' | 'success' | 'warning' | 'error' | 'question' | 'loading';
export type DialogThemeList = 'info' | 'success' | 'warning' | 'default' | 'danger';

export interface DialogOptions {
  body: string;
  header?: string;
  confirmText?: string | null;
  cancelText?: string | null;
  showOverlay?: boolean;
  theme?: DialogThemeList;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

/**
 * 页面交互相关的工具方法
 */
export default {
  // 弹出对话框
  dialog(options: DialogOptions) {
    const {
      body,
      theme,
      onConfirm,
      onCancel,
      onClose,
      showOverlay = true,
      header = '提示',
      confirmText = '确认',
      cancelText = '取消'
    } = options;
    return DialogPlugin.confirm({
      header,
      body,
      theme,
      onConfirm,
      onCancel,
      onClose,
      showOverlay,
      confirmBtn: confirmText,
      cancelBtn: cancelText
    });
  },
  // 弹出提示框
  message: MessagePlugin,
  // 通知提示
  notify: NotifyPlugin
};

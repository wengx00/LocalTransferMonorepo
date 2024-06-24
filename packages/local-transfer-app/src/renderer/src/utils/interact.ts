import { DialogCloseContext, DialogPlugin, MessagePlugin, NotifyPlugin } from 'tdesign-vue-next';

export type MessageThemeList = 'info' | 'success' | 'warning' | 'error' | 'question' | 'loading';
export type DialogThemeList = 'info' | 'success' | 'warning' | 'default' | 'danger';

export interface DialogOptions {
  content: string;
  title?: string;
  confirmText?: string | null;
  cancelText?: string | null;
  showOverlay?: boolean;
  theme?: DialogThemeList;
  onConfirm?: (context: { e: MouseEvent | KeyboardEvent }) => void;
  onCancel?: (context: { e: MouseEvent }) => void;
  onClose?: (context: DialogCloseContext) => void;
}

/**
 * 页面交互相关的工具方法
 */
export default {
  // 弹出对话框
  dialog(options: DialogOptions) {
    const {
      content: body,
      title: header = '提示',
      theme,
      onConfirm,
      onCancel,
      onClose,
      showOverlay = true,
      confirmText = '确认',
      cancelText = '取消'
    } = options;
    const dialog = DialogPlugin({
      header,
      body,
      theme,
      onConfirm: (context) => {
        dialog.hide();
        onConfirm?.(context);
      },
      onCancel: (context) => {
        dialog.hide();
        onCancel?.(context);
      },
      onClose: (context) => {
        dialog.hide();
        onClose?.(context);
      },
      showOverlay,
      confirmBtn: confirmText,
      cancelBtn: cancelText,
      closeOnOverlayClick: true,
      closeOnEscKeydown: true,
      destroyOnClose: true
    });
    return dialog;
  },
  // 弹出提示框
  message: MessagePlugin,
  // 通知提示
  notify: NotifyPlugin
};

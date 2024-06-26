import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => ({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@shared': resolve('src/shared') }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@pages': resolve('src/renderer/src/pages'),
        '@utils': resolve('src/renderer/src/utils'),
        '@assets': resolve('src/renderer/src/assets'),
        '@components': resolve('src/renderer/src/components'),
        '@shared': resolve('src/shared'),
        '@apis': resolve('src/renderer/src/apis')
      }
    },
    plugins: [vue()],
    base: loadEnv(mode, __dirname)?.VITE_BASE || '/',
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@assets/styles/utils.scss" as *;'
        }
      }
    }
  }
}));

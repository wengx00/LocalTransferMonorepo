import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import versionGenerator from './plugins/plugin-version-generator';
import packageJson from './package.json';

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
        '@apis': resolve('src/renderer/src/apis'),
        '@store': resolve('src/renderer/src/store')
      }
    },
    plugins: [
      vue(),
      versionGenerator({
        version: packageJson.version
      })
    ],
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

import { defineConfig } from 'vite';
import vueDtsPlugin from 'vite-plugin-dts';

export default defineConfig({
  plugins: [vueDtsPlugin()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'index',
      fileName: 'index',
    },
  },
});

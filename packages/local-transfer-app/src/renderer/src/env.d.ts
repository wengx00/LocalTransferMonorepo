/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'app-version' {
  const appVersion: string;
  export default appVersion;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_SLOGAN: string;
  readonly VITE_BASE: string;
  readonly VITE_MOBILE_LAYOUT_BREAKPOINT: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_CONTRIBUTOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

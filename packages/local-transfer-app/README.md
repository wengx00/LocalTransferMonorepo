# local-transfer-app

基于 Vue3 和 TypeScript 的 Electron App。

## 推荐IDE设置

- 使用 [VSCode](https://code.visualstudio.com/) 进行开发

- 安装以下 VSCode 插件：

  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 快速开始

- Node.js 版本：`v18` 以上

### 全局安装 pnpm

> 如果已经存在全局 `pnpm`，则直接进行下一步。

```bash
npm i -g pnpm
```

### 安装依赖

```bash
pnpm install
```

### 开发环境启动

```bash
pnpm dev
```

### 生产环境构建

```bash
# For windows
pnpm build:win

# For macOS
pnpm build:mac

# For Linux
pnpm build:linux
```

## 技术栈和相关文档

- [Electron](https://www.electronjs.org/zh/docs/latest)

- [Vue3](https://cn.vuejs.org/)

- 构建工具链：[electron-vite](https://cn.electron-vite.org/)

- 组件库：[tdesign-vue-next](https://tdesign.tencent.com/vue-next/overview)

- 页面路由：[Vue Router](https://router.vuejs.org/zh/index.html)

- 状态管理：[Pinia](https://pinia.cn/zh/)

- 规范化：[ESLint](https://eslint.org/)

## 目录结构

- `src/main`：Node.js 主进程代码

- `src/preload`：渲染进程预加载 Node.js 代码

- `src/renderer`：渲染进程前端代码（非 Node.js 环境）

### src/renderer

- `src/assets`：静态资源目录

- `src/components`：全局组件

- `src/pages`：页面路由，详见[常见问题](#常见问题)。

- `src/utils`：公共代码

  - `router`：路由目录

  - `store`：Pinia 的全局状态目录

  - `tools`：工具方法目录

  - `constants.ts`：常量代码

  - `interact.ts`：页面交互相关工具方法（对话框、消息提示、通知提示）

- `src/App.vue`：应用入口组件

- `src/env.d.ts`：全局类型声明， `.env` 文件的类型声明就在这

- `src/main.ts`：应用注册代码

### Vite 配置

项目使用 electron-vite 构建，`electron.vite.config.ts` 是其构建配置，一般来说无需变更。

### Electron 配置

项目根目录下的 `electron-builder.yml` 是配置 Electron 输出构建的文件，一般来说也无需变更。

## 常见问题

1. 页面路由规则

   - 项目遵循基于文件目录的路由方法，`@pages/` 下的每一层文件目录会生成一层路由。
   - 目录下的 `page.vue` 会作为页面组件， `layout.vue` 会作为页面的 Layout，`layout.vue` 是可选的。
   - 上层目录的 `layout.vue` 会影响到其所有子级目录，子级目录的 `layout.vue` 会嵌套在父级 `layout.vue` 之中。
   - 如果想要编写 `layout.vue`，需要使用 `<router-view />` 来让子级或同级 `page.vue` 插入。
   - 如果有不受 Layout 控制的页面，请以 `page.isolate.vue` 命名，并放在 `@pages/` 下的一级目录中，他将会逃逸在路由规则之外，同时在 `@router/index.ts` 中额外配置该条路由规则即可。
   - 以 `components` 命名的目录不会命中路由规则，而是会作为页面的子组件来看待。

2. 关于 `.env` 文件、vite 配置等，详见 [Vite 官网](https://cn.vitejs.dev/config/)

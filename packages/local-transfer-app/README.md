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

### 构建 Service 包

无论是本地运行还是生产构建，App 都依赖于底层的 Service 包，需要先进入 `packages/local-transfer-service` 进行构建

简单来说，就是进入 Service 目录运行 `pnpm build`，成功后再进行 App 开发环境启动或生产打包

Service 打包的详细指引请查看 `packages/local-transfer-service/README.md`

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

3. 本项目是 Monorepo，App 依赖于 `pnpm-workspace` 中的 `local-transfer-service` 包，该包存在于 Monorepo 下的 `packages/local-transfer-service`

4. `pnpm dev` 提示 "Electron uninstall" 的错误？

   > 问题和解决方法来源：[@pwq](https://github.com/pwqispwq)

   就是 Electron 没有安装成功，这个时候你需要：

   - 清除 pnpm 缓存：`pnpm store prune`

   - 配置一个你能访问的源：

     ```bash
     npm config set registry 源地址
     ```

     - 腾讯源：https://mirrors.tencent.com/npm/
     - 淘宝源：https://registry.npmmirror.com/
     - （默认）官方源：https://registry.npmjs.org/

   - 重新安装依赖：`pnpm install`




## 渲染进程和主进程 IPC 通信

我们知道不同进程间的对象（尤其是渲染进程和 Node.js 主进程之间）是没法共享单例的，为了解决渲染进程和主进程事件处理一致性的问题，项目使用了一些 TypeScript 的 trick，通过 `.d.ts` 拉齐全部 API invoke 和 listener 的参数类型。

> `.d.ts` 只是 TypeScript 在编译前的产物，他会在编译后蒸发，请不要陷入“主进程和渲染进程共享了同一份对象”的误区

作为开发者，其实无需关心实现细节，只需要明白两个问题：

- 如何调用接口

- 如何添加监听器

### 渲染进程调用接口

首先我们可以看到 `electron-vite.config.ts` 和 `tsconfig.web.json` 都已经配置好了 `src/renderer/src/apis` 的别名为 `@apis`，这意味着我们在引入这个目录中的东西时直接以 `@api` 为前缀即可

`@api` 目录下的每一个文件，都对应了 `@shared/types` 下的一个 `.d.ts` 中定义的接口。你可以在页面组件中这么引用

```typescript
import serviceApi from '@apis/service';
import { ServiceInfo } from 'local-transfer-service';

function addVerifiedDevice(target: ServiceInfo) {
  serviceApi.invoke.addVerifiedDevice(target.id);
}
```

即 `xxxApi.invoke.<command>` 的形式，如上的例子是“添加受信设备”的调用

使用 VS Code 或者其他智能 IDE，即可拥有**全部的类型提示**（类型的定义在 `src/shared/@types/xxxApi.d.ts` 中）


### 渲染进程添加监听器

类似上面的引入操作，只不过调用的代码改为了

`xxxApi.listener.<event>(handler)`

比如：

```typescript
import serviceApi from '@apis/service';

serviceApi.listener.onReceiveFile((context) => {
  console.log(context);
});
```

### 调用示例

可以在 `@pages/test/page.vue` 中看到测试的示例代码，包含调用成功提示、异常捕获等状态提示。

注意示例代码中混用了 `async/await` 和 Promise 回调（大杂烩），只是为了说明这两种方式都可以，在实际页面开发中请尽量保持统一和规范。

### IPC 常见问题

1. IPC 通信接口只能接受可以被[结构化克隆](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)的数据，简单来说，有下面几种常见的情况是不被支持的：
   - 函数
   - 包含不支持数据的对象
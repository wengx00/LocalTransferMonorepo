# local-transfer-service

基于 Node.js 和 TypeScript 的内网同传服务

## 相关文档

1. [Vitest](https://cn.vitest.dev/)

2. [Rollup](https://www.rollupjs.com/)

## 快速开始

### 下载依赖

```bash
pnpm install
```

### 打包构建

```bash
pnpm build
```

## 配合 Monorepo

本项目处于 Monorepo 中，为 `packages/local-transfer-app` 提供接口服务。

实际上，打包后的 `local-transfer-service` 就是一个 npm 包，可以在 `packages/local-transfer-app` 中引用和调用。

如果你查看整个 Monorepo 的根目录中的 `package.json`，就会发现下面的记录：

```json
{
  "dependencies": {
    "local-transfer-service": "workspace:^",
    "nanoid": "^5.0.7"
  }
}
```

这里的 `workspace:^` 含义就是使用 Workspace 中的包版本，也就是本项目的版本。

要为 APP 层提供服务，我们需要使用 `pnpm build` 来打包出一个 `dist` 目录，在 APP 中引用的 `local-transfer-service` 就是打包出的 `dist` 目录内的代码和声明文件。

## 构建流程

项目构建时需要经过三个阶段：vitest 单元测试 $\rarr$ tsc 检查和 `.d.ts` 类型输出 $\rarr$ rollup 构建打包

### 单元测试

- 项目使用 `Vitest` 进行单元测试，测试用例编写类似于 `src/core/service.test.ts`

- 运行单元测试

  ```bash
  pnpm test
  ```

> 在项目构建阶段会自动运行单元测试，全部通过才能进入下一个构建步骤

因为本项目功能上的特殊性，对功能点单元测试可能无法覆盖齐全，需要结合 APP 来验证功能可用性。

### TSC 检查和输出

项目使用 TypeScript 编译器输出 `.d.ts` 类型文件，输出的位置是 `dist/types`

在 tsc 运行时如果有语法错误也会中止构建流程。

### Rollup 构建

项目使用 `rollup` 构建，配置在 `rollup.config.js` 中。

如果要上线生产环境，可以开启配置中的 `terser` 插件（目前是注释状态），该插件会对代码进行最小化和压缩。

经过 rollup 构建的代码会在 `dist` 目录输出 ES Module 和 CommonJS 两种规范的文件，便于 CJS / ESM 的项目引用。


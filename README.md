# LocalTransfer 大仓

Monorepo 是指一个仓库之中有多个项目/模块（packages），本仓库为工程软件综合设计项目 LocalTransfer 的 Monorepo。

## 开发规范

1. 不要在 `master` 分支上做任何直接变更

2. App 的开发在 `release/app` 分支上进行，Service 的开发在 `release/service` 分支上进行，Bugfixes 可以在 `fix/个人ID` 分支进行

3. 经过自动流水线测试过后，可以在不同的 `release` 分支上对 `master` 分支提出 Pull Request（PR），经过至少一个不是自己的成员 Code Review 后可以 Merge 进 `master` 分支

4. 所有 Commits 都请按照 [Conventional Commits 规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/#%e7%ba%a6%e5%ae%9a%e5%bc%8f%e6%8f%90%e4%ba%a4%e8%a7%84%e8%8c%83) 进行，以下是部分消息含义的速览：

    - build: 影响构建系统或外部依赖项的更改（如：gulp、broccoli、npm）
    - ci: 对 CI 配置文件和脚本的更改（如 Dockerfile、ci.yml 等）
    - chore：修改杂物，比如 .gitignore
    - docs: 仅更改文档
    - feat: 新增功能
    - fix: 缺陷修复
    - perf: 性能优化的代码更改
    - refactor: 既不修复错误也不添加功能的代码更改（功能不变但重构了某部分代码）
    - style: 不影响代码含义的更改（空格、格式、缺少分号等）
    - test: 添加缺失的测试或纠正现有的测试
    - revert：回退以前的commit

## 快速开始

### App 开发

1. 拉取代码

    ```bash
    # 克隆仓库
    git clone git@github.com:wengx00/LocalTransferMonorepo.git
    # 进入 Monorepo 根目录
    cd LocalTransferMonorepo
    # 切换 app 分支
    git checkout release/app
    # 进入 app 项目目录
    cd packages/local-transfer-app
    ```

2. 接下来按照 `packages/local-transfer-app` 的 `README` 操作

3. 提交代码

    ```bash
    # 添加变更到暂存区
    git add .
    # 提交到本地仓库
    git commit -m "feat: xxx"
    # 推送到远程分支
    git push
    ```

### Service 开发

1. 拉取代码

    ```bash
    # 克隆仓库
    git clone git@github.com:wengx00/LocalTransferMonorepo.git
    # 进入 Monorepo 根目录
    cd LocalTransferMonorepo
    # 切换 service 分支
    git checkout release/service
    # 进入 service 项目目录
    cd packages/local-transfer-service
    ```

2. 接下来按照 `packages/local-transfer-service` 的 `README` 操作

3. 提交代码

    ```bash
    # 添加变更到暂存区
    git add .
    # 提交到本地仓库
    git commit -m "feat: xxx"
    # 推送到远程分支
    git push
    ```

## 常见问题
### Lockfile 冲突怎么办

> [解决方案原文](https://www.gahing.top/pages/e261ca/#%E4%B8%89%E7%A7%8D%E9%87%8D%E7%BD%AE%E6%96%B9%E6%A1%88)

- 项目已经使用 `.gitattributes` 指定了，若合并时 `pnpm-lock.yaml` 冲突，那么只以当前分支上的 Lockfile 为准。

- 此时 Lockfile 处于**信息丢失**状态，你只需运行一次 `pnpm install` 即可自动修复。

> 再次提醒，在项目根目录、项目子目录下都只用 `pnpm` 作为包管理工具，不要使用 `npm` | `yarn` | `cnpm` 等。

### App 构建问题

1. 检查 Node.js 版本 `>= 18`
2. 检查 Electron 是否成功安装
3. 检查 `packages/local-transfer-service` 是否成功构建
4. 首次进行 Windows 生产环境构建时，需要联网下载 `nsis`，所以请检查网络环境
import { Component } from 'vue';

export type LazyComponent = () => Promise<any>;

export interface Route {
  path: string;
  children: Route[];
  component?: LazyComponent | Component;
  layout?: LazyComponent | Component;
  loadingComponent?: LazyComponent | Component;
}

// 递归插入动态路由
export function progressiveInsertRoute(
  target: Route,
  path: string[],
  component: LazyComponent | Component
) {
  if (path.length === 1) {
    if (path[0] === 'page.vue') {
      // eslint-disable-next-line no-param-reassign
      target.component = component;
      return;
    }
    if (path[0] === 'layout.vue') {
      // eslint-disable-next-line no-param-reassign
      target.layout = component;
      return;
    }
    if (path[0] === 'loading.vue') {
      // eslint-disable-next-line no-param-reassign
      target.loadingComponent = component;
      return;
    }
    return;
  }
  const currentPath = path[0];
  if (currentPath === 'components') {
    // 忽略页面组件
    return;
  }
  let targetIndex = target.children.findIndex(({ path: p }) => p === currentPath);
  if (targetIndex === -1) {
    target.children.push({
      path: currentPath,
      children: []
    });
    targetIndex = target.children.length - 1;
  }
  progressiveInsertRoute(target.children[targetIndex], path.slice(1), component);
}

export function getAsyncRoutes(pages: Record<string, () => Promise<any>>) {
  const routes: Route = {
    path: '/',
    children: []
  };
  Object.entries(pages).forEach(([path, component]) => {
    const currentPath = path
      .slice('/src/pages/'.length)
      .split('/')
      .filter((item) => item.trim() !== '');
    progressiveInsertRoute(routes, currentPath, component);
  });

  return routes;
}

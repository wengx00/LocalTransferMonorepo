import { expect, test } from 'vitest';

import { Service } from './service';

const service = new Service({
  downloadRoot: './',
});

test('设置&获取Service名称', () => {
  service.setName('test');
  const name = service.getName();
  expect(name).toBe('test');
});

test('获取设备ID', () => {
  const id = service.getId();
  expect(id.length).toBe(8);
});

test('获取初始TCP端口', () => {
  expect(service.getTcpPort()).toBe(86);
});

test('设置&获取TCP端口', () => {
  service.setTcpPort(87);
  expect(service.getTcpPort()).toBe(87);
});

test('设置&获取下载根路径', () => {
  service.setDownloadRoot('/test');
  expect(service.getDownloadRoot()).toBe('/test');
});

import { expect, test } from 'vitest';

import { Service } from './service';

const service = new Service({
  downloadRoot: './',
});
test('设置Service名称', () => {
  service.setName('test');
  const name = service.getName();
  expect(name).toBe('test');
});

test('获取设备ID', () => {
  const id = service.getId();
  expect(id.length).toBe(8);
});

/**
 * @file mock-delay.test.ts
 * @description mock-delay 工具函数单元测试
 */

import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

describe('mockDelay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('默认延迟为 SHORT (500ms)', async () => {
    const promise = mockDelay();
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
  });

  test('自定义延迟时间', async () => {
    const promise = mockDelay(1000);
    jest.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });

  test('延迟 0ms 立即 resolve', async () => {
    const promise = mockDelay(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('MOCK_DELAY_MS 常量', () => {
  test('SHORT 为 500ms', () => {
    expect(MOCK_DELAY_MS.SHORT).toBe(500);
  });

  test('MEDIUM 为 800ms', () => {
    expect(MOCK_DELAY_MS.MEDIUM).toBe(800);
  });

  test('LONG 为 1000ms', () => {
    expect(MOCK_DELAY_MS.LONG).toBe(1000);
  });

  test('CONFIG 为 500ms', () => {
    expect(MOCK_DELAY_MS.CONFIG).toBe(500);
  });

  test('LOGIN 为 1500ms', () => {
    expect(MOCK_DELAY_MS.LOGIN).toBe(1500);
  });
});

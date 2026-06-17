/**
 * Jest 环境验证测试
 * 验证测试环境是否正确配置
 */

describe('Jest 环境验证', () => {
  test('基础断言可用', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBeTruthy();
    expect([1, 2, 3]).toHaveLength(3);
  });

  test('异步测试可用', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  test('mock 函数可用', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  test('对象匹配可用', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toMatchObject({ name: 'test' });
  });
});

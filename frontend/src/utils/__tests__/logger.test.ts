/**
 * @file logger.test.ts
 * @description logger 工具函数单元测试
 */

import logger, { generateRequestId, maskSensitive } from '@/utils/logger';

// Mock __DEV__
(global as any).__DEV__ = true;

describe('generateRequestId', () => {
  test('生成格式正确的 requestId', () => {
    const requestId = generateRequestId();
    expect(requestId).toMatch(/^RN\d{12}-[a-z0-9]{6}$/);
  });

  test('生成唯一的 requestId', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateRequestId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('maskSensitive', () => {
  test('密码字段被脱敏', () => {
    const data = { password: 'secret123', username: 'test' };
    const masked = maskSensitive(data);
    expect(masked.password).toBe('******');
    expect(masked.username).toBe('test');
  });

  test('token 字段被脱敏', () => {
    const data = { accessToken: 'abc123', refreshToken: 'def456' };
    const masked = maskSensitive(data);
    expect(masked.accessToken).toBe('******');
    expect(masked.refreshToken).toBe('******');
  });

  test('手机号被部分脱敏', () => {
    const data = { phone: '13800138000' };
    const masked = maskSensitive(data);
    expect(masked.phone).toBe('138****8000');
  });

  test('mobile 字段被部分脱敏', () => {
    const data = { mobile: '15912345678' };
    const masked = maskSensitive(data);
    expect(masked.mobile).toBe('159****5678');
  });

  test('嵌套对象被递归脱敏', () => {
    const data = {
      user: {
        name: 'test',
        password: 'secret',
      },
    };
    const masked = maskSensitive(data);
    expect(masked.user.password).toBe('******');
  });

  test('非对象值原样返回', () => {
    expect(maskSensitive(null)).toBeNull();
    expect(maskSensitive(undefined)).toBeUndefined();
    expect(maskSensitive('string')).toBe('string');
    expect(maskSensitive(123)).toBe(123);
  });
});

describe('logger', () => {
  beforeEach(() => {
    logger.clearHistory();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('debug 方法调用 console.log', () => {
    logger.debug({ module: 'test', operate: 'debug-test' });
    expect(console.log).toHaveBeenCalled();
  });

  test('info 方法调用 console.info', () => {
    logger.info({ module: 'test', operate: 'info-test', result: 'success' });
    expect(console.info).toHaveBeenCalled();
  });

  test('warn 方法调用 console.warn', () => {
    logger.warn({ module: 'test', operate: 'warn-test', result: 'warning' });
    expect(console.warn).toHaveBeenCalled();
  });

  test('error 方法调用 console.error', () => {
    logger.error({ module: 'test', operate: 'error-test', error: 'test error' });
    expect(console.error).toHaveBeenCalled();
  });

  test('fatal 方法调用 console.error', () => {
    logger.fatal({ module: 'test', operate: 'fatal-test', error: 'fatal error' });
    expect(console.error).toHaveBeenCalled();
  });

  test('日志被保存到历史记录', () => {
    logger.info({ module: 'test', operate: 'history-test' });
    const history = logger.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].module).toBe('test');
    expect(history[0].operate).toBe('history-test');
  });

  test('历史记录最多保留 100 条', () => {
    for (let i = 0; i < 150; i++) {
      logger.info({ module: 'test', operate: `test-${i}` });
    }
    const history = logger.getHistory();
    expect(history.length).toBe(100);
  });

  test('clearHistory 清空历史记录', () => {
    logger.info({ module: 'test', operate: 'test' });
    expect(logger.getHistory().length).toBe(1);
    logger.clearHistory();
    expect(logger.getHistory().length).toBe(0);
  });
});

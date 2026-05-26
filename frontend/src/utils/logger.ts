/**
 * 文件功能：通用日志工具，负责前端全场景日志采集与结构化输出
 * 关联业务：全模块通用，前后端日志格式完全统一
 * 说明：严格遵循团队日志规范 v1.0，禁止绕过此工具直接使用 console.log
 */

import { Platform } from 'react-native';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
type JsonPrimitive = string | number | boolean | null | undefined;
type JsonLike = JsonPrimitive | JsonLike[] | { [key: string]: JsonLike };

export type LoggerOptions = {
  module: string;
  operate?: string;
  params?: JsonLike | Record<string, unknown>;
  result?: string;
  error?: unknown;
  errorType?: string;
  requestId?: string;
};

type HistoryEntry = LoggerOptions & { level: LogLevel; time: string };

// ─────────────────────────────────────────────
// 日志级别定义（五级，数字越大越严重）
// ─────────────────────────────────────────────
const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

// 生产环境关闭 DEBUG，只显示 INFO 及以上
const CURRENT_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

// ─────────────────────────────────────────────
// 获取设备标识（自动识别 iOS / Android）
// 格式示例：iOS-16 / Android-13
// ─────────────────────────────────────────────
function getDeviceTag(): string {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const version = Platform.Version || 'unknown';
  return `${os}-${version}`;
}

// ─────────────────────────────────────────────
// 生成唯一请求 ID（全链路追踪用）
// 格式：RN + 日期 + 随机6位 例如：RN202603211430-a3f2k1
// ─────────────────────────────────────────────
export function generateRequestId(): string {
  const now = new Date();
  const date = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 12);
  const random = Math.random().toString(36).slice(2, 8);
  return `RN${date}-${random}`;
}

// ─────────────────────────────────────────────
// 敏感数据脱敏工具
// ─────────────────────────────────────────────
export function maskSensitive<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;

  const SENSITIVE_KEYS = [
    'password',
    'pwd',
    'token',
    'accessToken',
    'refreshToken',
    'idCard',
    'bankCard',
  ];
  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  for (const key of Object.keys(result)) {
    const val = result[key];
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k.toLowerCase()))) {
      result[key] = '******';
    } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
      result[key] = typeof val === 'string' ? val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : val;
    } else if (typeof val === 'object' && val !== null) {
      result[key] = maskSensitive(val);
    }
  }

  return result as T;
}

function formatParams(params?: LoggerOptions['params']): string {
  if (!params) return '';
  if (typeof params === 'string') return params;
  try {
    const masked = maskSensitive(params as Record<string, unknown>);
    return Object.entries(masked as Record<string, unknown>)
      .map(([k, v]) => `${k}:${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join(',');
  } catch {
    return '[参数序列化失败]';
  }
}

function buildLogMessage(level: LogLevel, options: LoggerOptions): string {
  const { module, operate, params, result, error, errorType, requestId } = options;

  const time = new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '-');

  const device = getDeviceTag();
  const rid = requestId || generateRequestId();
  const paramsStr = formatParams(params);
  let msg = `[${level}] [${time}] [requestId: ${rid}] [module: ${module}] [device: ${device}]`;

  if (operate) msg += ` [operate: ${operate}]`;
  if (paramsStr) msg += ` [params: ${paramsStr}]`;

  if (level === 'ERROR' || level === 'FATAL') {
    if (error) msg += ` [error: ${typeof error === 'object' ? JSON.stringify(error) : String(error)}]`;
  } else if (result) {
    msg += ` [result: ${result}]`;
  }

  if (errorType) msg += ` [errorType: ${errorType}]`;

  return msg;
}

const logHistory: HistoryEntry[] = [];
const MAX_HISTORY = 100;

function saveToHistory(entry: HistoryEntry): void {
  if (logHistory.length >= MAX_HISTORY) logHistory.shift();
  logHistory.push(entry);
}

function output(level: LogLevel, levelValue: number, options: LoggerOptions): void {
  if (levelValue < CURRENT_LEVEL) return;

  const msg = buildLogMessage(level, options);
  saveToHistory({ ...options, level, time: new Date().toISOString() });

  switch (level) {
    case 'DEBUG':
      console.log(msg);
      break;
    case 'INFO':
      console.info(msg);
      break;
    case 'WARN':
      console.warn(msg);
      break;
    case 'ERROR':
    case 'FATAL':
      console.error(msg);
      break;
  }
}

const logger = {
  debug: (options: LoggerOptions) => output('DEBUG', LOG_LEVELS.DEBUG, options),
  info: (options: LoggerOptions) => output('INFO', LOG_LEVELS.INFO, options),
  warn: (options: LoggerOptions) => output('WARN', LOG_LEVELS.WARN, options),
  error: (options: LoggerOptions) => output('ERROR', LOG_LEVELS.ERROR, options),
  fatal: (options: LoggerOptions) => output('FATAL', LOG_LEVELS.FATAL, options),
  getHistory: (): HistoryEntry[] => [...logHistory],
  clearHistory: (): void => {
    logHistory.length = 0;
  },
  printHistory: (): void => {
    console.log('=== 日志历史 ===');
    logHistory.forEach((e) => console.log(`[${e.level}] [${e.module}] ${e.operate || ''}`));
    console.log('================');
  },
};

export default logger;

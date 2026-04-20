/**
 * 文件功能：后端通用日志工具，负责全模块结构化日志输出、敏感数据脱敏、全链路请求ID传递
 * 关联业务：全模块通用（用户服务、订单服务、拼车服务等所有后端业务场景）
 * 说明：严格遵循团队编码规范 1.2 日志规范，禁止直接使用 console.log，
 *       requestId 由前端生成并通过请求头传入，后端直接读取使用，实现全链路追踪
 */

'use strict';

const os = require('os');

// ─────────────────────────────────────────────
// 日志级别定义（固定五级，与前端完全一致）
// ─────────────────────────────────────────────
const LOG_LEVELS = {
  DEBUG: 0,
  INFO:  1,
  WARN:  2,
  ERROR: 3,
  FATAL: 4,
};

// 生产环境关闭 DEBUG，只显示 INFO 及以上
const ENV = process.env.NODE_ENV || 'development';
const CURRENT_LEVEL = ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// ─────────────────────────────────────────────
// 获取服务节点标识（自动读取主机名）
// 输出格式：node-server-01 / node-MacBook-Pro
// ─────────────────────────────────────────────
const SERVER_NODE = `node-${os.hostname()}`;

// ─────────────────────────────────────────────
// 生成后端唯一请求 ID（仅在前端未传时兜底使用）
// 输出格式：BE202603211430001
// ─────────────────────────────────────────────
let requestCounter = 0;

function generateRequestId() {
  const now = new Date();
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
  ].join('');
  requestCounter = (requestCounter + 1) % 1000;
  // 兼容：前端前缀RN，后端前缀BE，方便区分来源
  return `BE${datePart}${pad(requestCounter, 3)}`;
}

// ─────────────────────────────────────────────
// 敏感数据脱敏工具（与前端规则完全一致）
// 用法：maskSensitive({ phone: '13812341234', password: '123456' })
// 输出：{ phone: '138****1234', password: '******' }
// ─────────────────────────────────────────────
function maskSensitive(data) {
  if (!data || typeof data !== 'object') return data;

  const FULL_MASK_KEYS = ['password', 'pwd', 'token', 'accesstoken', 'refreshtoken',
                          'idcard', 'bankcard', 'secret', 'key'];
  const result = { ...data };

  for (const key of Object.keys(result)) {
    const val = result[key];
    const lowerKey = key.toLowerCase();

    if (FULL_MASK_KEYS.some(k => lowerKey.includes(k))) {
      result[key] = '******';
    } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
      result[key] = typeof val === 'string'
        ? val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        : val;
    } else if (typeof val === 'object' && val !== null) {
      result[key] = maskSensitive(val);
    }
  }

  return result;
}

// ─────────────────────────────────────────────
// 格式化 params 为日志字符串
// ─────────────────────────────────────────────
function formatParams(params) {
  if (!params) return '';
  if (typeof params === 'string') return params;
  try {
    const masked = maskSensitive(params);
    return Object.entries(masked)
      .map(([k, v]) => `${k}:${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(',');
  } catch {
    return '[参数序列化失败]';
  }
}

// ─────────────────────────────────────────────
// 格式化当前时间
// 输出格式：2026-03-21 14:30:25
// ─────────────────────────────────────────────
function getCurrentTime() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// ─────────────────────────────────────────────
// 核心日志格式化
// 与前端格式完全一致，仅 device 替换为 serverNode
// [级别] [时间] [requestId] [module] [serverNode] [operate] [params] [result/error+errorType]
// ─────────────────────────────────────────────
function buildLogMessage(level, options) {
  const { module, operate, params, result, error, errorType, requestId } = options;

  const time      = getCurrentTime();
  const rid       = requestId || generateRequestId();
  const paramsStr = formatParams(params);

  let msg = `[${level}] [${time}] [requestId: ${rid}] [module: ${module}] [serverNode: ${SERVER_NODE}]`;

  if (operate)   msg += ` [operate: ${operate}]`;
  if (paramsStr) msg += ` [params: ${paramsStr}]`;

  if (level === 'ERROR' || level === 'FATAL') {
    if (error)     msg += ` [error: ${typeof error === 'object' ? JSON.stringify(error) : error}]`;
    if (errorType) msg += ` [errorType: ${errorType}]`;
  } else {
    if (result) msg += ` [result: ${result}]`;
  }

  return msg;
}

// ─────────────────────────────────────────────
// 内部输出函数
// ─────────────────────────────────────────────
function output(level, levelValue, options) {
  if (levelValue < CURRENT_LEVEL) return;

  const msg = buildLogMessage(level, options);

  switch (level) {
    case 'DEBUG': console.log(msg);   break;
    case 'INFO':  console.info(msg);  break;
    case 'WARN':  console.warn(msg);  break;
    case 'ERROR':
    case 'FATAL': console.error(msg); break;
  }
}

// ─────────────────────────────────────────────
// 导出 Logger 对象
// ─────────────────────────────────────────────
const logger = {
  /**
   * 函数功能：打印 DEBUG 级别日志，开发调试专用，生产环境自动禁用
   * 入参：options（对象）- { module, operate, params, requestId }
   * 出参：void
   */
  debug: (options) => output('DEBUG', LOG_LEVELS.DEBUG, options),

  /**
   * 函数功能：打印 INFO 级别日志，记录正常接口请求与业务流程
   * 入参：options（对象）- { module, operate, params, result, requestId }
   * 出参：void
   */
  info: (options) => output('INFO', LOG_LEVELS.INFO, options),

  /**
   * 函数功能：打印 WARN 级别日志，记录参数不规范、非阻断性异常
   * 入参：options（对象）- { module, operate, params, result, requestId }
   * 出参：void
   */
  warn: (options) => output('WARN', LOG_LEVELS.WARN, options),

  /**
   * 函数功能：打印 ERROR 级别日志，记录接口失败、业务阻断异常
   * 入参：options（对象）- { module, operate, params, error, errorType, requestId }
   * 出参：void
   * 说明：所有 catch 块必须调用，不得静默处理异常
   */
  error: (options) => output('ERROR', LOG_LEVELS.ERROR, options),

  /**
   * 函数功能：打印 FATAL 级别日志，记录服务宕机、核心功能不可用
   * 入参：options（对象）- { module, operate, error, errorType, requestId }
   * 出参：void
   * 说明：触发后需立即通知团队，同步上报监控
   */
  fatal: (options) => output('FATAL', LOG_LEVELS.FATAL, options),
};

module.exports = { logger, maskSensitive, generateRequestId };
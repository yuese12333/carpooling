/**
 * 文件功能：通用日志工具，负责前端全场景日志采集与结构化输出
 * 关联业务：全模块通用，前后端日志格式完全统一
 * 说明：严格遵循团队日志规范 v1.0，禁止绕过此工具直接使用 console.log
 */

import { Platform } from 'react-native';

// ─────────────────────────────────────────────
// 日志级别定义（五级，数字越大越严重）
// ─────────────────────────────────────────────
const LOG_LEVELS = {
  DEBUG: 0,
  INFO:  1,
  WARN:  2,
  ERROR: 3,
  FATAL: 4,
};

// 生产环境关闭 DEBUG，只显示 INFO 及以上
const CURRENT_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

// ─────────────────────────────────────────────
// 获取设备标识（自动识别 iOS / Android）
// 格式示例：iOS-16-iPhone / Android-13
// ─────────────────────────────────────────────
function getDeviceTag() {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const version = Platform.Version || 'unknown';
  return `${os}-${version}`;
}

// ─────────────────────────────────────────────
// 生成唯一请求 ID（全链路追踪用）
// 格式：RN + 日期 + 随机6位 例如：RN202603211430-a3f2k1
// ─────────────────────────────────────────────
export function generateRequestId() {
  const now = new Date();
  const date = now.toISOString().replace(/[-T:\.Z]/g, '').slice(0, 12); // 202603211430
  const random = Math.random().toString(36).slice(2, 8);                 // a3f2k1
  return `RN${date}-${random}`;
}

// ─────────────────────────────────────────────
// 敏感数据脱敏工具
// 调用方式：maskSensitive({ phone: '13812341234', password: '123456' })
// 输出：    { phone: '138****1234', password: '******' }
// ─────────────────────────────────────────────
export function maskSensitive(data) {
  if (!data || typeof data !== 'object') return data;

  const SENSITIVE_KEYS = ['password', 'pwd', 'token', 'accessToken', 'refreshToken', 'idCard', 'bankCard'];
  const result = { ...data };

  for (const key of Object.keys(result)) {
    const val = result[key];
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      // 密码、token 等完全掩码
      result[key] = '******';
    } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
      // 手机号中间四位掩码：138****1234
      result[key] = typeof val === 'string'
        ? val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
        : val;
    } else if (typeof val === 'object' && val !== null) {
      // 递归处理嵌套对象
      result[key] = maskSensitive(val);
    }
  }

  return result;
}

// ─────────────────────────────────────────────
// 格式化参数为字符串（用于日志输出）
// ─────────────────────────────────────────────
function formatParams(params) {
  if (!params) return '';
  if (typeof params === 'string') return params;
  try {
    return Object.entries(params)
      .map(([k, v]) => `${k}:${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(',');
  } catch {
    return '[参数序列化失败]';
  }
}

// ─────────────────────────────────────────────
// 核心日志格式化（严格按照规范字段顺序）
// 
// 规范格式：
// [级别] [时间] [requestId:xxx] [module:xxx] [device:xxx]
// [operate:xxx] [params:xxx] [result:xxx]          ← INFO/WARN
// [error:xxx] [errorType:xxx]                      ← ERROR/FATAL
// ─────────────────────────────────────────────
function buildLogMessage(level, options) {
  const {
    module,       // 模块名，如 user-login
    operate,      // 操作描述，如 '用户登录'
    params,       // 业务参数（已脱敏）
    result,       // 执行结果（INFO/WARN用）
    error,        // 错误描述（ERROR/FATAL用）
    errorType,    // 错误类型（ERROR/FATAL用）
    requestId,    // 请求唯一ID
  } = options;

  const time = new Date().toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');

  const device = getDeviceTag();
  const rid = requestId || generateRequestId();
  const paramsStr = formatParams(params);

  // 固定字段顺序拼接
  let msg = `[${level}] [${time}] [requestId: ${rid}] [module: ${module}] [device: ${device}]`;

  if (operate)  msg += ` [operate: ${operate}]`;
  if (paramsStr) msg += ` [params: ${paramsStr}]`;

  // INFO/WARN 输出 result，ERROR/FATAL 输出 error + errorType
  if (level === 'ERROR' || level === 'FATAL') {
    if (error)     msg += ` [error: ${typeof error === 'object' ? JSON.stringify(error) : error}]`;
    if (errorType) msg += ` [errorType: ${errorType}]`;
  } else {
    if (result) msg += ` [result: ${result}]`;
  }

  return msg;
}

// ─────────────────────────────────────────────
// 日志历史（最多保留 100 条，方便调试时回溯）
// ─────────────────────────────────────────────
const logHistory = [];
const MAX_HISTORY = 100;

function saveToHistory(entry) {
  if (logHistory.length >= MAX_HISTORY) logHistory.shift();
  logHistory.push(entry);
}

// ─────────────────────────────────────────────
// 核心输出函数
// ─────────────────────────────────────────────
function output(level, levelValue, options) {
  if (levelValue < CURRENT_LEVEL) return;

  const msg = buildLogMessage(level, options);
  saveToHistory({ ...options, level, time: new Date().toISOString() });

  switch (level) {
    case 'DEBUG': console.log(msg);   break;
    case 'INFO':  console.info(msg);  break;
    case 'WARN':  console.warn(msg);  break;
    case 'ERROR': console.error(msg); break;
    case 'FATAL': console.error(msg); break; // FATAL 也用 error 输出，最醒目
  }
}

// ─────────────────────────────────────────────
// 导出的 Logger 对象
// ─────────────────────────────────────────────
/**
 * 使用方式：
 *
 * logger.info({
 *   module: 'user-login',
 *   operate: '用户登录',
 *   params: maskSensitive({ phone: '13812341234' }),
 *   result: '登录成功，token生成完成',
 *   requestId: rid,   // 可选，不传自动生成
 * });
 *
 * logger.error({
 *   module: 'order-create',
 *   operate: '创建订单',
 *   params: { goodsId: 1001 },
 *   error: '商品库存不足',
 *   errorType: '业务参数异常',
 *   requestId: rid,
 * });
 */
const logger = {
  /**
   * DEBUG - 开发调试专用，生产环境自动禁用
   * @param {object} options - { module, operate, params, result, requestId }
   */
  debug: (options) => output('DEBUG', LOG_LEVELS.DEBUG, options),

  /**
   * INFO - 记录正常业务流程、关键操作成功
   */
  info: (options) => output('INFO', LOG_LEVELS.INFO, options),

  /**
   * WARN - 非阻断性异常、潜在风险
   */
  warn: (options) => output('WARN', LOG_LEVELS.WARN, options),

  /**
   * ERROR - 业务阻断、功能异常，需定位修复
   */
  error: (options) => output('ERROR', LOG_LEVELS.ERROR, options),

  /**
   * FATAL - 系统崩溃、核心功能不可用，触发告警
   */
  fatal: (options) => output('FATAL', LOG_LEVELS.FATAL, options),

  // ── 工具方法 ──
  getHistory:   () => [...logHistory],
  clearHistory: () => { logHistory.length = 0; },
  printHistory: () => {
    console.log('=== 日志历史 ===');
    logHistory.forEach(e => console.log(`[${e.level}] [${e.module}] ${e.operate || ''}`));
    console.log('================');
  },
};

export default logger;
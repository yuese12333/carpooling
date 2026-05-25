/**
 * 文件功能：风控 DAO（mock）
 * 关联业务：手机号风控检测
 */
const { logger, maskSensitive } = require('../utils/logger');

const phoneBlacklist = new Set(['13900000000']);

/**
 * 函数功能：检查手机号是否命中黑名单
 * 入参：phone/requestId
 * 出参：boolean（是否命中黑名单）
 */
async function checkPhoneBlacklist(phone, requestId) {
  const inBlacklist = phoneBlacklist.has(phone);
  logger.debug({
    module: 'risk-dao',
    operate: 'check-phone-blacklist',
    params: maskSensitive({ phone }),
    result: inBlacklist ? 'Phone in blacklist' : 'Phone not in blacklist',
    requestId,
  });
  return inBlacklist;
}

/**
 * 函数功能：检查手机号是否存在设备滥用风险
 * 入参：phone/requestId
 * 出参：boolean（是否存在风险）
 */
async function checkPhoneDeviceAbuse(phone, requestId) {
  // mock: 特定号码模拟多设备异常
  const hasRisk = phone.endsWith('9999');
  logger.debug({
    module: 'risk-dao',
    operate: 'check-phone-device-abuse',
    params: maskSensitive({ phone }),
    result: hasRisk ? 'Phone has device abuse risk' : 'Phone has no device abuse risk',
    requestId,
  });
  return hasRisk;
}

module.exports = {
  checkPhoneBlacklist,
  checkPhoneDeviceAbuse,
};

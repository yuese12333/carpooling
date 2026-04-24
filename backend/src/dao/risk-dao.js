/**
 * 文件功能：风控 DAO（mock）
 * 关联业务：手机号风控检测
 */

const phoneBlacklist = new Set(['13900000000']);

async function checkPhoneBlacklist(phoneNumber) {
  return phoneBlacklist.has(phoneNumber);
}

async function checkPhoneDeviceAbuse(phoneNumber) {
  // mock: 特定号码模拟多设备异常
  return phoneNumber.endsWith('9999');
}

module.exports = {
  checkPhoneBlacklist,
  checkPhoneDeviceAbuse,
};

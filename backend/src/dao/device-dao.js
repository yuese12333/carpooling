/**
 * 文件功能：设备风控 DAO（mock）
 * 关联业务：设备风险评级
 */

const highRiskDeviceIds = new Set(['device_risk_001', 'emulator_001']);

async function findRiskRecord(deviceId, ip) {
  return {
    isKnownRiskDevice: highRiskDeviceIds.has(deviceId),
    recentLoginUsers: deviceId ? (deviceId.endsWith('shared') ? 6 : 1) : 0,
    ip,
  };
}

module.exports = {
  findRiskRecord,
};

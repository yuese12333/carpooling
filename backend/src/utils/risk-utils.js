/**
 * 文件功能：风控工具（mock）
 * 关联业务：行为验签、设备风险评分
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function analyzeTrackData(trackData) {
  const eventCount = Number(trackData?.eventCount || 0);
  const durationMs = Number(trackData?.durationMs || 0);
  const avgSpeed = Number(trackData?.avgSpeed || 0);

  let score = 20;
  if (eventCount > 15) score += 20;
  if (durationMs > 400) score += 20;
  if (avgSpeed > 0 && avgSpeed < 2.5) score += 15;

  score = clamp(score, 0, 100);
  return {
    score,
    status: score >= 50 ? 'pass' : 'fail',
  };
}

function calculateDeviceScore({ deviceInfo, riskRecord, region }) {
  let score = 10;

  if (riskRecord?.isKnownRiskDevice) score += 65;
  if ((riskRecord?.recentLoginUsers || 0) > 3) score += 25;
  if (region?.isProxy) score += 30;
  if (String(deviceInfo?.platform || '').toLowerCase() === 'android' && deviceInfo?.isRooted) {
    score += 20;
  }

  return clamp(score, 0, 100);
}

function getDeviceRiskLevel(score) {
  const normalizedScore = clamp(Number(score || 0), 0, 100);
  if (normalizedScore >= 75) return 'high';
  if (normalizedScore >= 45) return 'medium';
  return 'low';
}

module.exports = {
  analyzeTrackData,
  calculateDeviceScore,
  getDeviceRiskLevel,
};

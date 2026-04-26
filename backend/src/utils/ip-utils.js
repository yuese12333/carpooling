/**
 * 文件功能：IP 工具（mock）
 * 关联业务：设备风险评级
 */

function parseRegion(ip) {
  const ipText = String(ip || '');
  const isLoopback = ipText === '127.0.0.1';
  return {
    country: 'CN',
    region: isLoopback ? 'LOCAL' : 'Unknown',
    city: isLoopback ? 'Localhost' : 'Unknown',
    isProxy: ipText.startsWith('10.') || ipText.startsWith('172.16.'),
  };
}

module.exports = {
  parseRegion,
};

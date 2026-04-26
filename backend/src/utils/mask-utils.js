/**
 * 文件功能：脱敏工具
 * 关联业务：演示账号配置
 */

function maskPhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

module.exports = {
  maskPhone,
};

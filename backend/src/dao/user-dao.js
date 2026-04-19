/**
 * 文件功能：用户数据访问层
 * 关联业务：用户登录鉴权
 * 说明：当前为内存实现，后续可替换为数据库访问实现
 */

// 约定：passwordHash 使用 SHA-256 十六进制字符串
const users = [
  {
    userId: 'u_10001',
    phone: '13800138000',
    passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    userName: '张三',
    avatarUrl: 'https://example.com/avatar.png',
    lastLoginAt: null,
    lastLoginDeviceInfo: null,
  },
];

/**
 * 函数功能：按手机号查询用户
 * 入参：phone（手机号）
 * 出参：用户对象或 null
 */
async function findByPhone(phone) {
  return users.find((item) => item.phone === phone) || null;
}

/**
 * 函数功能：更新用户最近登录时间与设备信息
 * 入参：userId、lastLoginAt、deviceInfo
 * 出参：更新后的用户对象或 null
 */
async function updateLastLoginInfo(userId, { lastLoginAt, deviceInfo }) {
  const user = users.find((item) => item.userId === userId);
  if (!user) return null;

  user.lastLoginAt = lastLoginAt;
  user.lastLoginDeviceInfo = deviceInfo || null;

  return user;
}

module.exports = {
  findByPhone,
  updateLastLoginInfo,
};

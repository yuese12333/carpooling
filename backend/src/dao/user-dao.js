/**
 * 文件功能：用户数据访问层
 * 关联业务：用户登录鉴权
 * 说明：使用 MySQL 持久化存储登录用户数据
 */
const pool = require('../config/db');
const { logger } = require('../utils/logger');

let ensureAuthUsersTablePromise;

function formatDateTimeForMySql(input) {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function ensureAuthUsersTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS auth_users (
      user_id VARCHAR(64) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      user_name VARCHAR(50) NOT NULL,
      avatar_url VARCHAR(255) DEFAULT '',
      last_login_at DATETIME NULL,
      last_login_device_info TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id),
      UNIQUE KEY uk_auth_users_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.query(createSql);
}

async function ensureAuthUsersTableOnce() {
  if (!ensureAuthUsersTablePromise) {
    ensureAuthUsersTablePromise = ensureAuthUsersTable().catch((error) => {
      // 首次初始化失败时允许后续请求重试，避免进程生命周期内永久失败
      ensureAuthUsersTablePromise = null;
      throw error;
    });
  }
  return ensureAuthUsersTablePromise;
}

/**
 * 函数功能：按手机号查询用户
 * 入参：phone（手机号）
 * 出参：用户对象或 null
 */
async function findByPhone(phone) {
  await ensureAuthUsersTableOnce();

  const sql = `
    SELECT
      user_id AS userId,
      phone,
      password_hash AS passwordHash,
      user_name AS userName,
      avatar_url AS avatarUrl,
      last_login_at AS lastLoginAt,
      last_login_device_info AS lastLoginDeviceInfo
    FROM auth_users
    WHERE phone = :phone
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, { phone });
  return rows?.[0] || null;
}

/**
 * 函数功能：更新用户最近登录时间与设备信息
 * 入参：userId、lastLoginAt、deviceInfo
 * 出参：更新后的用户对象或 null
 */
async function updateLastLoginInfo(userId, { lastLoginAt, deviceInfo }) {
  await ensureAuthUsersTableOnce();

  const sql = `
    UPDATE auth_users
    SET
      last_login_at = :lastLoginAt,
      last_login_device_info = :lastLoginDeviceInfo
    WHERE user_id = :userId
  `;

  const payload = {
    userId,
    lastLoginAt: formatDateTimeForMySql(lastLoginAt),
    lastLoginDeviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
  };
  await pool.execute(sql, payload);

  logger.info({
    module: 'user-dao',
    operate: 'update-last-login-info',
    params: { userId },
    result: 'Auth login info updated',
  });
}

module.exports = {
  findByPhone,
  updateLastLoginInfo,
};

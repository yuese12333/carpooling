/**
 * 文件功能：用户数据访问层
 * 关联业务：用户基础信息表创建与查询
 */
const pool = require('../config/db');
const { logger } = require('../utils/logger');

async function ensureUsersTable(requestId) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      phone VARCHAR(20) NOT NULL,
      nickname VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    logger.debug({
      module: 'users-dao',
      operate: 'ensure-users-table',
      requestId,
      params: { action: 'CREATE TABLE IF NOT EXISTS' },
      result: 'Executing table creation',
    });

    await pool.query(sql);

    logger.info({
      module: 'users-dao',
      operate: 'ensure-users-table',
      requestId,
      result: 'Users table ensured',
    });
  } catch (error) {
    logger.error({
      module: 'users-dao',
      operate: 'ensure-users-table',
      requestId,
      error: error.message,
      errorType: 'DatabaseTableCreationError',
    });
    throw error;
  }
}

async function createUser({ phone, nickname }, requestId) {
  const sql = `
    INSERT INTO users (phone, nickname)
    VALUES (:phone, :nickname)
  `;

  try {
    logger.debug({
      module: 'users-dao',
      operate: 'create-user',
      requestId,
      params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), nickname },
      result: 'Executing user insert',
    });

    const [result] = await pool.execute(sql, { phone, nickname });

    logger.info({
      module: 'users-dao',
      operate: 'create-user',
      requestId,
      result: `User created with insertId: ${result?.insertId}`,
    });

    return result?.insertId;
  } catch (error) {
    logger.error({
      module: 'users-dao',
      operate: 'create-user',
      requestId,
      error: error.message,
      errorType: 'DatabaseInsertError',
    });
    throw error;
  }
}

async function findUserByPhone(phone, requestId) {
  const sql = `
    SELECT id, phone, nickname, created_at AS createdAt, updated_at AS updatedAt
    FROM users
    WHERE phone = :phone
    LIMIT 1
  `;

  try {
    logger.debug({
      module: 'users-dao',
      operate: 'find-user-by-phone',
      requestId,
      params: { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
      result: 'Executing user query',
    });

    const [rows] = await pool.execute(sql, { phone });

    logger.debug({
      module: 'users-dao',
      operate: 'find-user-by-phone',
      requestId,
      result: rows?.[0] ? 'User found' : 'User not found',
    });

    return rows?.[0] || null;
  } catch (error) {
    logger.error({
      module: 'users-dao',
      operate: 'find-user-by-phone',
      requestId,
      error: error.message,
      errorType: 'DatabaseQueryError',
    });
    throw error;
  }
}

module.exports = {
  ensureUsersTable,
  createUser,
  findUserByPhone,
};

/**
 * 文件功能：用户数据访问层
 * 关联业务：用户基础信息表创建与查询
 */
const pool = require('../config/db');

async function ensureUsersTable() {
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

  await pool.query(sql);
}

async function createUser({ phone, nickname }) {
  const sql = `
    INSERT INTO users (phone, nickname)
    VALUES (:phone, :nickname)
  `;

  const [result] = await pool.execute(sql, { phone, nickname });
  return result?.insertId;
}

async function findUserByPhone(phone) {
  const sql = `
    SELECT id, phone, nickname, created_at AS createdAt, updated_at AS updatedAt
    FROM users
    WHERE phone = :phone
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, { phone });
  return rows?.[0] || null;
}

module.exports = {
  ensureUsersTable,
  createUser,
  findUserByPhone,
};

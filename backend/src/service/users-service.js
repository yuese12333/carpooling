/**
 * 文件功能：用户业务服务层
 * 关联业务：用户数据初始化与最小注册能力
 */
const {
  ensureUsersTable,
  createUser,
  findUserByPhone,
} = require('../dao/users-dao');

async function initUsersSchema() {
  await ensureUsersTable();
  return { initialized: true };
}

async function registerUser({ phone, nickname }) {
  const existed = await findUserByPhone(phone);
  if (existed) {
    return {
      created: false,
      user: existed,
      reason: 'PHONE_ALREADY_EXISTS',
    };
  }

  const insertId = await createUser({ phone, nickname });
  const createdUser = await findUserByPhone(phone);

  return {
    created: Boolean(insertId),
    user: createdUser,
  };
}

module.exports = {
  initUsersSchema,
  registerUser,
};

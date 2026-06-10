/**
 * 文件功能：用户业务服务层
 * 关联业务：用户数据初始化与最小注册能力
 */
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { createAuthUser, findByPhone } = require('../dao/user-dao');
const passwordUtils = require('../utils/password-utils');
const { logger, maskSensitive } = require('../utils/logger');

function buildUserId() {
  return `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

function buildRegisterUserView(authUser) {
  if (!authUser) return null;
  return {
    userId: authUser.userId,
    phone: authUser.phone,
    nickname: authUser.userName,
    userName: authUser.userName,
    avatarUrl: authUser.avatarUrl || '',
    createdAt: authUser.createdAt || null,
    updatedAt: authUser.updatedAt || null,
  };
}

async function checkCoreSchema(requestId) {
  try {
    logger.info({
      module: 'users-service',
      operate: 'check-core-schema',
      requestId,
      result: 'Checking prisma migration managed schema',
    });

    await prisma.$queryRaw`SELECT 1`;

    logger.info({
      module: 'users-service',
      operate: 'check-core-schema',
      requestId,
      result: 'Prisma schema connectivity check passed',
    });
    return {
      initialized: true,
      managedBy: 'prisma-migrate',
    };
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'check-core-schema',
      requestId,
      error: error.message,
      errorType: 'ServiceSchemaCheckError',
    });
    throw error;
  }
}

async function initCoreSchema(requestId) {
  try {
    logger.info({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      result: 'Init schema requested in prisma migration mode',
    });

    const initResult = await checkCoreSchema(requestId);

    logger.info({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      result: 'Schema check completed (no runtime DDL)',
    });
    return initResult;
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'init-core-schema',
      requestId,
      error: error.message,
      errorType: 'ServiceSchemaInitError',
    });
    throw error;
  }
}

async function registerUser({ phone, nickname, password }, requestId) {
  try {
    logger.info({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      params: {
        phone: maskSensitive({ phone }).phone,
        nickname,
      },
      result: 'Starting user registration',
    });

    const existed = await findByPhone(phone, requestId);
    if (existed) {
      return {
        created: false,
        user: buildRegisterUserView(existed),
        reason: 'PHONE_ALREADY_EXISTS',
      };
    }

    const passwordHash = await passwordUtils.hash(password);
    const userId = buildUserId();

    try {
      await createAuthUser({
        userId,
        phone,
        passwordHash,
        userName: nickname,
        avatarUrl: '',
      }, requestId);
    } catch (error) {
      if (error && (error.code === 'P2002' || error.code === 'ER_DUP_ENTRY')) {
        const duplicatedUser = await findByPhone(phone, requestId);
        return {
          created: false,
          user: buildRegisterUserView(duplicatedUser),
          reason: 'PHONE_ALREADY_EXISTS',
        };
      }
      throw error;
    }

    const createdUser = await findByPhone(phone, requestId);

    logger.info({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      result: `User registered successfully with userId: ${userId}`,
    });
    return {
      created: true,
      user: buildRegisterUserView(createdUser),
    };
  } catch (error) {
    logger.error({
      module: 'users-service',
      operate: 'register-user',
      requestId,
      error: error.message,
      errorType: 'ServiceUserRegisterError',
    });
    throw error;
  }
}

/**
 * 返回用户实名/认证状态
 */
async function getAuthStatus(userId, requestId) {
  try {
    const auth = await prisma.realNameAuth.findUnique({ where: { user_id: userId } }).catch(() => null);
    if (!auth) return { verifyStatus: 'not_submitted', verifiedAt: null };
    return { verifyStatus: auth.verify_status, verifiedAt: auth.verified_at || null };
  } catch (error) {
    logger.error({ module: 'users-service', operate: 'get-auth-status', params: { userId }, requestId, error: error.message });
    throw error;
  }
}

/**
 * 获取邀请信息（我的邀请码与邀请记录汇总）
 */
async function getInviteInfo(userId, requestId) {
  try {
    const invite = await prisma.inviteCode.findUnique({ where: { user_id: userId } }).catch(() => null);
    const records = await prisma.inviteRecord.findMany({ where: { invite_code: invite ? invite.invite_code : undefined } }).catch(() => []);
    return {
      inviteCode: invite ? invite.invite_code : null,
      totalInvited: records.length,
      totalReward: records.reduce((s, r) => s + Number(r.reward_amount || 0), 0),
      records: records.map((r) => ({ invitee: r.invitee_user_id, amount: r.reward_amount, status: r.reward_status, createdAt: r.created_at })),
    };
  } catch (error) {
    logger.error({ module: 'users-service', operate: 'get-invite-info', params: { userId }, requestId, error: error.message });
    throw error;
  }
}

/**
 * 记录一次分享事件（用于 track-share）
 */
async function recordShareEvent(userId, platform, scene = 'invite', requestId) {
  try {
    const rec = await prisma.shareEvent.create({ data: { user_id: userId, platform, scene } });
    return { success: true, id: rec.id.toString() };
  } catch (error) {
    logger.error({ module: 'users-service', operate: 'record-share-event', params: { userId, platform, scene }, requestId, error: error.message });
    throw error;
  }
}

/**
 * 提交实名认证
 * 入参：{ userId, name, idNumber, idType, requestId }
 * 出参：脱敏后的 RealNameInfo
 *
 * 课程设计阶段：身份证号写入 sha256 哈希 + 掩码两份，明文不落库；
 * verify_status 默认 pending，演示需要可在这里直接置 verified 并写 verified_at。
 */
async function submitRealNameAuth({ userId, name, idNumber, idType = 'id_card', requestId }) {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedId = typeof idNumber === 'string' ? idNumber.trim() : '';
  if (!trimmedName) {
    const err = new Error('姓名不能为空');
    err.statusCode = 400;
    throw err;
  }
  if (!/^\d{17}[\dXx]$|^\d{15}$/.test(trimmedId)) {
    const err = new Error('身份证号格式不合法');
    err.statusCode = 400;
    throw err;
  }

  const idHash = passwordUtils.sha256(trimmedId);
  const idMask = trimmedId.length === 18
    ? `${trimmedId.slice(0, 3)}***********${trimmedId.slice(-4)}`
    : `${trimmedId.slice(0, 3)}********${trimmedId.slice(-4)}`;
  const nameMask = trimmedName.length <= 1 ? trimmedName : `*${trimmedName.slice(1)}`;

  try {
    const existing = await prisma.realNameAuth.findUnique({ where: { user_id: userId } }).catch(() => null);
    if (existing && existing.verify_status === 'verified') {
      const err = new Error('已完成实名认证，无需重复提交');
      err.statusCode = 409;
      throw err;
    }

    const authId = existing?.auth_id || `rna_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const data = {
      real_name: trimmedName,
      id_type: idType,
      id_number_hash: idHash,
      id_number_mask: idMask,
      verify_status: 'verified', // 课设演示自动通过；接生产时改为 pending 并交人工/三方审核
      verified_at: new Date(),
    };

    if (existing) {
      await prisma.realNameAuth.update({ where: { user_id: userId }, data });
    } else {
      await prisma.realNameAuth.create({ data: { auth_id: authId, user_id: userId, ...data } });
    }

    logger.info({ module: 'users-service', operate: 'submit-real-name-auth', params: { userId, idType, nameLength: trimmedName.length, idLength: trimmedId.length }, requestId, result: 'verified' });

    return {
      isVerified: true,
      realName: nameMask,
      idCardNo: idMask,
      idType: idType === 'id_card' ? '中国居民身份证' : idType,
    };
  } catch (error) {
    if (!error.statusCode) {
      logger.error({ module: 'users-service', operate: 'submit-real-name-auth', params: { userId }, requestId, error: error.message });
    }
    throw error;
  }
}

module.exports = {
  checkCoreSchema,
  initCoreSchema,
  registerUser,
  getAuthStatus,
  submitRealNameAuth,
  getInviteInfo,
  recordShareEvent,
};

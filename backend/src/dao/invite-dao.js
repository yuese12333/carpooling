/**
 * 文件功能：邀请码数据访问层
 * 关联业务：邀请码生成、邀请记录
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');
const { randomUUID } = require('crypto');

/**
 * 生成用户邀请码
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 */
async function createInviteCode(userId, requestId) {
  try {
    // 生成6位邀请码
    const code = generateInviteCode();

    const inviteCode = await prisma.inviteCode.create({
      data: {
        invite_code: code,
        user_id: userId,
        status: 'active',
      },
    });

    logger.info({
      module: 'invite-dao',
      operate: 'create-invite-code',
      params: { userId },
      result: `Invite code created: ${code}`,
      requestId,
    });

    return inviteCode;
  } catch (error) {
    logger.error({
      module: 'invite-dao',
      operate: 'create-invite-code',
      params: { userId },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

/**
 * 获取用户邀请码
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 */
async function getInviteCodeByUserId(userId, requestId) {
  try {
    let inviteCode = await prisma.inviteCode.findFirst({
      where: { user_id: userId },
    });

    // 如果没有邀请码，自动生成一个
    if (!inviteCode) {
      inviteCode = await createInviteCode(userId, requestId);
    }

    return inviteCode;
  } catch (error) {
    logger.error({
      module: 'invite-dao',
      operate: 'get-invite-code',
      params: { userId },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

/**
 * 根据邀请码查询
 * @param {string} code - 邀请码
 * @param {string} requestId - 请求ID
 */
async function findByCode(code, requestId) {
  try {
    return prisma.inviteCode.findUnique({
      where: { invite_code: code },
      include: { user: { select: { user_id: true, user_name: true } } },
    });
  } catch (error) {
    logger.error({
      module: 'invite-dao',
      operate: 'find-by-code',
      params: { code },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

/**
 * 创建邀请记录
 * @param {Object} data - 邀请记录数据
 * @param {string} requestId - 请求ID
 */
async function createInviteRecord(data, requestId) {
  const { inviteCode, inviteeUserId, rewardAmount } = data;

  try {
    const record = await prisma.inviteRecord.create({
      data: {
        invite_code: inviteCode,
        invitee_user_id: inviteeUserId,
        reward_amount: rewardAmount || 0,
        reward_status: 'pending',
      },
    });

    logger.info({
      module: 'invite-dao',
      operate: 'create-invite-record',
      params: { inviteCode, inviteeUserId },
      result: 'Invite record created',
      requestId,
    });

    return record;
  } catch (error) {
    logger.error({
      module: 'invite-dao',
      operate: 'create-invite-record',
      params: { inviteCode, inviteeUserId },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

/**
 * 获取用户邀请记录列表
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} requestId - 请求ID
 */
async function getInviteRecords(userId, page, pageSize, requestId) {
  try {
    // 先获取用户的邀请码
    const inviteCode = await prisma.inviteCode.findFirst({
      where: { user_id: userId },
    });

    if (!inviteCode) {
      return { records: [], total: 0, totalReward: 0 };
    }

    const skip = (page - 1) * pageSize;

    const [records, total, totalRewardResult] = await Promise.all([
      prisma.inviteRecord.findMany({
        where: { invite_code: inviteCode.invite_code },
        include: {
          invitee: {
            select: { user_id: true, user_name: true, avatar_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.inviteRecord.count({
        where: { invite_code: inviteCode.invite_code },
      }),
      prisma.inviteRecord.aggregate({
        where: { invite_code: inviteCode.invite_code, reward_status: 'completed' },
        _sum: { reward_amount: true },
      }),
    ]);

    return {
      records,
      total,
      totalReward: Number(totalRewardResult._sum.reward_amount || 0),
    };
  } catch (error) {
    logger.error({
      module: 'invite-dao',
      operate: 'get-invite-records',
      params: { userId },
      error: error.message,
      requestId,
    });
    throw error;
  }
}

/**
 * 生成6位邀请码
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = {
  createInviteCode,
  getInviteCodeByUserId,
  findByCode,
  createInviteRecord,
  getInviteRecords,
};

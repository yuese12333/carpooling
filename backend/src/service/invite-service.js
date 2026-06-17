/**
 * 文件功能：邀请码服务层
 * 关联业务：邀请码生成、邀请奖励
 */
const inviteDao = require('../dao/invite-dao');
const { logger } = require('../utils/logger');

// 邀请奖励金额（可配置）
const INVITE_REWARD_AMOUNT = 10.00;

/**
 * 获取用户邀请码
 * @param {string} userId - 用户ID
 */
async function getMyInviteCode({ userId, requestId }) {
  logger.info({
    module: 'invite-service',
    operate: 'get-my-invite-code',
    params: { userId },
    result: 'Getting invite code',
    requestId,
  });

  const inviteCode = await inviteDao.getInviteCodeByUserId(userId, requestId);

  return {
    code: inviteCode.invite_code,
    status: inviteCode.status,
    createdAt: inviteCode.created_at,
  };
}

/**
 * 使用邀请码
 * @param {string} code - 邀请码
 * @param {string} inviteeUserId - 被邀请人ID
 */
async function useInviteCode({ code, inviteeUserId, requestId }) {
  logger.info({
    module: 'invite-service',
    operate: 'use-invite-code',
    params: { code, inviteeUserId },
    result: 'Using invite code',
    requestId,
  });

  // 查询邀请码
  const inviteCodeData = await inviteDao.findByCode(code, requestId);
  if (!inviteCodeData) {
    const error = new Error('邀请码不存在');
    error.statusCode = 400;
    throw error;
  }

  if (inviteCodeData.status !== 'active') {
    const error = new Error('邀请码已失效');
    error.statusCode = 400;
    throw error;
  }

  // 不能邀请自己
  if (inviteCodeData.user_id === inviteeUserId) {
    const error = new Error('不能使用自己的邀请码');
    error.statusCode = 400;
    throw error;
  }

  // 创建邀请记录
  const record = await inviteDao.createInviteRecord(
    {
      inviteCode: code,
      inviteeUserId,
      rewardAmount: INVITE_REWARD_AMOUNT,
    },
    requestId,
  );

  return {
    success: true,
    inviterName: inviteCodeData.user.user_name,
    rewardAmount: INVITE_REWARD_AMOUNT,
  };
}

/**
 * 获取邀请记录
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
async function getInviteHistory({ userId, page, pageSize, requestId }) {
  logger.info({
    module: 'invite-service',
    operate: 'get-invite-history',
    params: { userId, page },
    result: 'Getting invite history',
    requestId,
  });

  const { records, total, totalReward } = await inviteDao.getInviteRecords(userId, page, pageSize, requestId);

  return {
    records: records.map((r) => ({
      id: r.id.toString(),
      inviteeName: r.invitee?.user_name || '未知用户',
      inviteeAvatar: r.invitee?.avatar_url,
      rewardAmount: Number(r.reward_amount),
      rewardStatus: r.reward_status,
      createdAt: r.created_at,
    })),
    total,
    totalReward,
    page,
    pageSize,
  };
}

/**
 * 获取邀请统计
 * @param {string} userId - 用户ID
 */
async function getInviteStats({ userId, requestId }) {
  const { total, totalReward } = await inviteDao.getInviteRecords(userId, 1, 1, requestId);

  return {
    totalInvites: total,
    totalReward,
  };
}

module.exports = {
  getMyInviteCode,
  useInviteCode,
  getInviteHistory,
  getInviteStats,
};

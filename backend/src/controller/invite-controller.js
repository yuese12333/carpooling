/**
 * 文件功能：邀请码控制层
 * 关联业务：邀请码管理
 */
const {
  getMyInviteCode,
  useInviteCode,
  getInviteHistory,
  getInviteStats,
} = require('../service/invite-service');
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * 获取我的邀请码
 * GET /api/invite/my-code
 */
async function getMyCodeController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  try {
    const data = await getMyInviteCode({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'invite-controller',
      operate: 'get-my-code',
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取邀请码失败', null, requestId));
  }
}

/**
 * 使用邀请码
 * POST /api/invite/use
 */
async function useCodeController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { code } = req.body || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  if (!code) {
    return res.status(400).json(buildFailureResponse(400, '请输入邀请码', null, requestId));
  }

  try {
    const data = await useInviteCode({ code, inviteeUserId: userId, requestId });
    logger.info({
      module: 'invite-controller',
      operate: 'use-code',
      params: { code },
      result: 'Invite code used',
      requestId,
    });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'invite-controller',
      operate: 'use-code',
      params: { code },
      error: error.message,
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '使用邀请码失败', null, requestId));
  }
}

/**
 * 获取邀请记录
 * GET /api/invite/history
 */
async function getHistoryController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { page = 1, pageSize = 10 } = req.query || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  try {
    const data = await getInviteHistory({
      userId,
      page: Number(page),
      pageSize: Number(pageSize),
      requestId,
    });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'invite-controller',
      operate: 'get-history',
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取邀请记录失败', null, requestId));
  }
}

/**
 * 获取邀请统计
 * GET /api/invite/stats
 */
async function getStatsController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  try {
    const data = await getInviteStats({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'invite-controller',
      operate: 'get-stats',
      error: error.message,
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '获取统计失败', null, requestId));
  }
}

module.exports = {
  getMyCodeController,
  useCodeController,
  getHistoryController,
  getStatsController,
};

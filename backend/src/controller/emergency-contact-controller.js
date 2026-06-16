/**
 * 文件功能：紧急联系人控制层
 * 关联业务：紧急联系人管理、行程共享通知
 */
const {
  getContactList,
  addContact,
  updateContact,
  deleteContact,
  sendTripShareNotification,
} = require('../service/emergency-contact-service');
const {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
} = require('../utils/response');
const { logger, maskSensitive } = require('../utils/logger');

/**
 * 获取紧急联系人列表
 * GET /api/emergency-contacts
 */
async function getContactListController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  try {
    const data = await getContactList({ userId, requestId });
    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'emergency-contact-controller',
      operate: 'get-contact-list',
      params: { userId },
      error: error.message,
      errorType: error.name || 'UnknownError',
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '获取联系人列表失败', null, requestId));
  }
}

/**
 * 添加紧急联系人
 * POST /api/emergency-contacts
 */
async function addContactController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { contactName, contactPhone, relationType, isPrimary } = req.body || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  // 参数校验
  if (!contactName || typeof contactName !== 'string' || !contactName.trim()) {
    return res.status(400).json(buildFailureResponse(400, '联系人姓名不能为空', null, requestId));
  }

  if (!contactPhone || typeof contactPhone !== 'string') {
    return res.status(400).json(buildFailureResponse(400, '联系人手机号不能为空', null, requestId));
  }

  try {
    const data = await addContact({
      userId,
      contactName: contactName.trim(),
      contactPhone,
      relationType,
      isPrimary,
      requestId,
    });

    logger.info({
      module: 'emergency-contact-controller',
      operate: 'add-contact',
      params: { userId, contactName },
      result: 'Contact added',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'emergency-contact-controller',
      operate: 'add-contact',
      params: { userId, contactName },
      error: error.message,
      errorType: error.name || 'UnknownError',
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '添加联系人失败', null, requestId));
  }
}

/**
 * 更新紧急联系人
 * PUT /api/emergency-contacts/:id
 */
async function updateContactController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const contactId = req.params?.id;
  const { contactName, contactPhone, relationType, isPrimary } = req.body || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  if (!contactId) {
    return res.status(400).json(buildFailureResponse(400, '联系人ID不能为空', null, requestId));
  }

  try {
    const data = await updateContact({
      contactId: BigInt(contactId),
      userId,
      data: { contactName, contactPhone, relationType, isPrimary },
      requestId,
    });

    logger.info({
      module: 'emergency-contact-controller',
      operate: 'update-contact',
      params: { userId, contactId },
      result: 'Contact updated',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'emergency-contact-controller',
      operate: 'update-contact',
      params: { userId, contactId },
      error: error.message,
      errorType: error.name || 'UnknownError',
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '更新联系人失败', null, requestId));
  }
}

/**
 * 删除紧急联系人
 * DELETE /api/emergency-contacts/:id
 */
async function deleteContactController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const contactId = req.params?.id;

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  if (!contactId) {
    return res.status(400).json(buildFailureResponse(400, '联系人ID不能为空', null, requestId));
  }

  try {
    const data = await deleteContact({
      contactId: BigInt(contactId),
      userId,
      requestId,
    });

    logger.info({
      module: 'emergency-contact-controller',
      operate: 'delete-contact',
      params: { userId, contactId },
      result: 'Contact deleted',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'emergency-contact-controller',
      operate: 'delete-contact',
      params: { userId, contactId },
      error: error.message,
      errorType: error.name || 'UnknownError',
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '删除联系人失败', null, requestId));
  }
}

/**
 * 发送行程共享通知
 * POST /api/emergency-contacts/send-trip-share
 */
async function sendTripShareController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  const userId = req.user?.userId;
  const { rideId } = req.body || {};

  if (!userId) {
    return res.status(401).json(buildFailureResponse(401, '未登录', null, requestId));
  }

  if (!rideId) {
    return res.status(400).json(buildFailureResponse(400, '行程ID不能为空', null, requestId));
  }

  try {
    const data = await sendTripShareNotification({ userId, rideId, requestId });

    logger.info({
      module: 'emergency-contact-controller',
      operate: 'send-trip-share',
      params: { userId, rideId },
      result: data.success ? 'Notification sent' : 'Notification failed',
      requestId,
    });

    return res.json(buildSuccessResponse(data, requestId));
  } catch (error) {
    logger.error({
      module: 'emergency-contact-controller',
      operate: 'send-trip-share',
      params: { userId, rideId },
      error: error.message,
      errorType: error.name || 'UnknownError',
      requestId,
    });
    const status = error.statusCode || 500;
    return res.status(status).json(buildFailureResponse(status, error.message || '发送通知失败', null, requestId));
  }
}

module.exports = {
  getContactListController,
  addContactController,
  updateContactController,
  deleteContactController,
  sendTripShareController,
};

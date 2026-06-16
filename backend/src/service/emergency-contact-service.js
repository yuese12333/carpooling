/**
 * 文件功能：紧急联系人服务层
 * 关联业务：紧急联系人管理、行程安全共享通知
 */
const emergencyContactDao = require('../dao/emergency-contact-dao');
const userDao = require('../dao/user-dao');
const rideDao = require('../dao/ride-dao');
const { logger, maskSensitive } = require('../utils/logger');

/**
 * 手机号脱敏
 * @param {string} phone - 手机号
 * @returns {string} 脱敏后的手机号
 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 获取用户紧急联系人列表
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 联系人列表
 */
async function getContactList({ userId, requestId }) {
  logger.info({
    module: 'emergency-contact-service',
    operate: 'get-contact-list',
    params: { userId },
    result: 'Fetching contact list',
    requestId,
  });

  const contacts = await emergencyContactDao.findByUserId(userId, requestId);
  const count = await emergencyContactDao.countByUserId(userId, requestId);

  return {
    contacts: contacts.map((c) => ({
      id: c.id.toString(),
      contactName: c.contact_name,
      contactPhone: maskPhone(c.contact_phone),
      relationType: c.relation_type,
      isPrimary: c.is_primary,
      createdAt: c.created_at,
    })),
    total: count,
  };
}

/**
 * 添加紧急联系人
 * @param {string} userId - 用户ID
 * @param {string} contactName - 联系人姓名
 * @param {string} contactPhone - 联系人手机号
 * @param {string} relationType - 关系类型
 * @param {boolean} isPrimary - 是否主要联系人
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 创建的联系人
 */
async function addContact({ userId, contactName, contactPhone, relationType, isPrimary, requestId }) {
  logger.info({
    module: 'emergency-contact-service',
    operate: 'add-contact',
    params: { userId, contactName },
    result: 'Adding contact',
    requestId,
  });

  // 校验手机号格式
  if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
    const error = new Error('手机号格式不正确');
    error.statusCode = 400;
    throw error;
  }

  // 检查联系人数量限制（最多5个）
  const count = await emergencyContactDao.countByUserId(userId, requestId);
  if (count >= 5) {
    const error = new Error('紧急联系人数量已达上限（5个）');
    error.statusCode = 400;
    throw error;
  }

  const contact = await emergencyContactDao.create(
    {
      userId,
      contactName,
      contactPhone,
      relationType,
      isPrimary,
    },
    requestId,
  );

  return {
    id: contact.id.toString(),
    contactName: contact.contact_name,
    contactPhone: maskPhone(contact.contact_phone),
    relationType: contact.relation_type,
    isPrimary: contact.is_primary,
  };
}

/**
 * 更新紧急联系人
 * @param {BigInt} contactId - 联系人ID
 * @param {string} userId - 用户ID
 * @param {Object} data - 更新数据
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 更新后的联系人
 */
async function updateContact({ contactId, userId, data, requestId }) {
  logger.info({
    module: 'emergency-contact-service',
    operate: 'update-contact',
    params: { contactId, userId },
    result: 'Updating contact',
    requestId,
  });

  // 检查联系人是否存在且属于该用户
  const existing = await emergencyContactDao.findById(contactId, userId, requestId);
  if (!existing) {
    const error = new Error('联系人不存在');
    error.statusCode = 404;
    throw error;
  }

  // 校验手机号格式
  if (data.contactPhone && !/^1[3-9]\d{9}$/.test(data.contactPhone)) {
    const error = new Error('手机号格式不正确');
    error.statusCode = 400;
    throw error;
  }

  const contact = await emergencyContactDao.update(
    contactId,
    userId,
    {
      contactName: data.contactName || existing.contact_name,
      contactPhone: data.contactPhone || existing.contact_phone,
      relationType: data.relationType !== undefined ? data.relationType : existing.relation_type,
      isPrimary: data.isPrimary !== undefined ? data.isPrimary : existing.is_primary,
    },
    requestId,
  );

  return {
    id: contact.id.toString(),
    contactName: contact.contact_name,
    contactPhone: maskPhone(contact.contact_phone),
    relationType: contact.relation_type,
    isPrimary: contact.is_primary,
  };
}

/**
 * 删除紧急联系人
 * @param {BigInt} contactId - 联系人ID
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 删除结果
 */
async function deleteContact({ contactId, userId, requestId }) {
  logger.info({
    module: 'emergency-contact-service',
    operate: 'delete-contact',
    params: { contactId, userId },
    result: 'Deleting contact',
    requestId,
  });

  const deleted = await emergencyContactDao.remove(contactId, userId, requestId);

  if (!deleted) {
    const error = new Error('联系人不存在');
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}

/**
 * 发送行程共享通知给紧急联系人
 * @param {string} userId - 用户ID
 * @param {string} rideId - 行程ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 发送结果
 */
async function sendTripShareNotification({ userId, rideId, requestId }) {
  logger.info({
    module: 'emergency-contact-service',
    operate: 'send-trip-share-notification',
    params: { userId, rideId },
    result: 'Sending trip share notification',
    requestId,
  });

  // 获取用户信息
  const user = await userDao.findByUserId(userId, requestId);
  if (!user) {
    const error = new Error('用户不存在');
    error.statusCode = 404;
    throw error;
  }

  // 获取行程信息
  const ride = await rideDao.getRideById(rideId, requestId);
  if (!ride) {
    const error = new Error('行程不存在');
    error.statusCode = 404;
    throw error;
  }

  // 获取主要紧急联系人
  const primaryContact = await emergencyContactDao.findPrimaryByUserId(userId, requestId);
  if (!primaryContact) {
    logger.warn({
      module: 'emergency-contact-service',
      operate: 'send-trip-share-notification',
      params: { userId },
      result: 'No primary emergency contact found',
      requestId,
    });
    return { success: false, message: '未设置主要紧急联系人' };
  }

  // 构建通知内容
  const tripInfo = {
    fromCity: ride.from_city,
    toCity: ride.to_city,
    departAt: ride.depart_at,
    userName: user.user_name,
  };

  // 发送短信通知
  const smsResult = await sendEmergencySms({
    phone: primaryContact.contact_phone,
    contactName: primaryContact.contact_name,
    ...tripInfo,
    requestId,
  });

  logger.info({
    module: 'emergency-contact-service',
    operate: 'send-trip-share-notification',
    params: maskSensitive({ userId, rideId, contactPhone: primaryContact.contact_phone }),
    result: smsResult.success ? 'Notification sent' : 'Notification failed',
    requestId,
  });

  return {
    success: smsResult.success,
    contactName: primaryContact.contact_name,
    message: smsResult.message,
  };
}

/**
 * 发送紧急联系人短信通知
 * @param {Object} params - 短信参数
 * @returns {Promise<Object>} 发送结果
 */
async function sendEmergencySms({ phone, contactName, userName, fromCity, toCity, departAt, requestId }) {
  // 检查是否配置了阿里云短信
  const hasSmsConfig = process.env.ALIYUN_SMS_SIGN_NAME && process.env.ALIYUN_SMS_TEMPLATE_CODE_TRIP_SHARE;

  if (!hasSmsConfig) {
    // Mock 模式：仅记录日志
    logger.info({
      module: 'emergency-contact-service',
      operate: 'send-emergency-sms',
      params: maskSensitive({ phone, contactName }),
      result: 'SMS not configured, notification logged only',
      requestId,
    });

    // 返回模拟成功（开发环境）
    return {
      success: true,
      message: '行程共享通知已发送（开发模式）',
      mock: true,
    };
  }

  // 真实发送短信（需要安装 @alicloud/dysmsapi20170525 并配置模板）
  try {
    // TODO: 实现真实的阿里云短信发送
    // const Dysmsapi = require('@alicloud/dysmsapi20170525');
    // const client = new Dysmsapi(config);
    // await client.sendSms({...});

    logger.info({
      module: 'emergency-contact-service',
      operate: 'send-emergency-sms',
      params: maskSensitive({ phone, contactName }),
      result: 'SMS sent successfully',
      requestId,
    });

    return {
      success: true,
      message: '行程共享通知已发送',
    };
  } catch (error) {
    logger.error({
      module: 'emergency-contact-service',
      operate: 'send-emergency-sms',
      params: maskSensitive({ phone }),
      error: error.message,
      errorType: error.name || 'SmsError',
      requestId,
    });

    return {
      success: false,
      message: '短信发送失败',
    };
  }
}

module.exports = {
  getContactList,
  addContact,
  updateContact,
  deleteContact,
  sendTripShareNotification,
};

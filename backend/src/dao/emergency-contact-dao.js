/**
 * 文件功能：紧急联系人数据访问层
 * 关联业务：紧急联系人管理、行程安全共享
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

/**
 * 获取用户紧急联系人列表
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Array>} 紧急联系人列表
 */
async function findByUserId(userId, requestId) {
  try {
    const contacts = await prisma.emergencyContact.findMany({
      where: { user_id: userId },
      orderBy: [{ is_primary: 'desc' }, { created_at: 'desc' }],
    });

    logger.info({
      module: 'emergency-contact-dao',
      operate: 'find-by-user-id',
      params: { userId },
      result: `Found ${contacts.length} contacts`,
      requestId,
    });

    return contacts;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'find-by-user-id',
      params: { userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 根据ID获取紧急联系人
 * @param {BigInt} contactId - 联系人ID
 * @param {string} userId - 用户ID（用于权限校验）
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object|null>} 联系人信息
 */
async function findById(contactId, userId, requestId) {
  try {
    const contact = await prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        user_id: userId,
      },
    });

    return contact;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'find-by-id',
      params: { contactId, userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 创建紧急联系人
 * @param {Object} data - 联系人数据
 * @param {string} data.userId - 用户ID
 * @param {string} data.contactName - 联系人姓名
 * @param {string} data.contactPhone - 联系人手机号
 * @param {string} data.relationType - 关系类型
 * @param {boolean} data.isPrimary - 是否主要联系人
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 创建的联系人
 */
async function create(data, requestId) {
  const { userId, contactName, contactPhone, relationType, isPrimary } = data;

  try {
    // 如果设置为主要联系人，先取消其他主要联系人
    if (isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false },
      });
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        user_id: userId,
        contact_name: contactName,
        contact_phone: contactPhone,
        relation_type: relationType || null,
        is_primary: isPrimary || false,
      },
    });

    logger.info({
      module: 'emergency-contact-dao',
      operate: 'create',
      params: { userId, contactName },
      result: 'Contact created',
      requestId,
    });

    return contact;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'create',
      params: { userId, contactName },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 更新紧急联系人
 * @param {BigInt} contactId - 联系人ID
 * @param {string} userId - 用户ID
 * @param {Object} data - 更新数据
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object>} 更新后的联系人
 */
async function update(contactId, userId, data, requestId) {
  const { contactName, contactPhone, relationType, isPrimary } = data;

  try {
    // 如果设置为主要联系人，先取消其他主要联系人
    if (isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false },
      });
    }

    const contact = await prisma.emergencyContact.update({
      where: {
        id: contactId,
        user_id: userId,
      },
      data: {
        contact_name: contactName,
        contact_phone: contactPhone,
        relation_type: relationType || null,
        is_primary: isPrimary || false,
      },
    });

    logger.info({
      module: 'emergency-contact-dao',
      operate: 'update',
      params: { contactId, userId },
      result: 'Contact updated',
      requestId,
    });

    return contact;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'update',
      params: { contactId, userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 删除紧急联系人
 * @param {BigInt} contactId - 联系人ID
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<boolean>} 是否删除成功
 */
async function remove(contactId, userId, requestId) {
  try {
    const result = await prisma.emergencyContact.deleteMany({
      where: {
        id: contactId,
        user_id: userId,
      },
    });

    const deleted = result.count > 0;

    logger.info({
      module: 'emergency-contact-dao',
      operate: 'remove',
      params: { contactId, userId },
      result: deleted ? 'Contact deleted' : 'Contact not found',
      requestId,
    });

    return deleted;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'remove',
      params: { contactId, userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 获取用户主要紧急联系人
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<Object|null>} 主要联系人
 */
async function findPrimaryByUserId(userId, requestId) {
  try {
    const contact = await prisma.emergencyContact.findFirst({
      where: {
        user_id: userId,
        is_primary: true,
      },
    });

    return contact;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'find-primary-by-user-id',
      params: { userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

/**
 * 统计用户紧急联系人数量
 * @param {string} userId - 用户ID
 * @param {string} requestId - 请求ID
 * @returns {Promise<number>} 联系人数量
 */
async function countByUserId(userId, requestId) {
  try {
    const count = await prisma.emergencyContact.count({
      where: { user_id: userId },
    });

    return count;
  } catch (error) {
    logger.error({
      module: 'emergency-contact-dao',
      operate: 'count-by-user-id',
      params: { userId },
      error: error.message,
      errorType: error.name || 'DatabaseError',
      requestId,
    });
    throw error;
  }
}

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  remove,
  findPrimaryByUserId,
  countByUserId,
};

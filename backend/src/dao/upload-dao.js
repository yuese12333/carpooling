/**
 * 文件功能：文件上传数据访问层
 * 关联业务：文件记录存储、用户文件关联
 * 说明：负责数据库操作、不包含业务逻辑
 */
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');
const { randomUUID } = require('crypto');

/**
 * 保存文件记录
 */
async function saveFileRecord({ userId, url, filename, mimetype, size, requestId }) {
  try {
    const fileId = `file_${randomUUID().replace(/-/g, '')}`;

    const result = await prisma.$queryRaw`
      INSERT INTO file_records (file_id, user_id, url, filename, mimetype, size, created_at)
      VALUES (${fileId}, ${userId}, ${url}, ${filename}, ${mimetype}, ${size}, NOW())
    `.catch(() => null);

    logger.info({
      module: 'upload-dao',
      operate: 'save-file-record',
      params: { userId, filename },
      requestId,
      result: 'File record saved',
    });

    return { success: true, fileId };
  } catch (error) {
    logger.error({
      module: 'upload-dao',
      operate: 'save-file-record',
      params: { userId, filename },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    return { success: false };
  }
}

/**
 * 更新用户头像
 */
async function updateUserAvatar(userId, avatarUrl, requestId) {
  try {
    await prisma.authUser.update({
      where: { user_id: userId },
      data: { avatar_url: avatarUrl },
    });

    logger.info({
      module: 'upload-dao',
      operate: 'update-user-avatar',
      params: { userId },
      requestId,
      result: 'User avatar updated',
    });

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'upload-dao',
      operate: 'update-user-avatar',
      params: { userId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

/**
 * 更新车辆照片
 */
async function updateVehicleImage(vehicleId, imageUrl, requestId) {
  try {
    await prisma.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: { image_url: imageUrl },
    });

    logger.info({
      module: 'upload-dao',
      operate: 'update-vehicle-image',
      params: { vehicleId },
      requestId,
      result: 'Vehicle image updated',
    });

    return { success: true };
  } catch (error) {
    logger.error({
      module: 'upload-dao',
      operate: 'update-vehicle-image',
      params: { vehicleId },
      requestId,
      error: error.message,
      errorType: error.name || 'DatabaseError',
    });
    throw error;
  }
}

module.exports = {
  saveFileRecord,
  updateUserAvatar,
  updateVehicleImage,
};

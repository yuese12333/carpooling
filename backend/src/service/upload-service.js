/**
 * 文件功能：文件上传业务逻辑层，负责文件合法性校验与公网访问URL生成
 * 关联业务：用户头像上传、车辆照片上传
 * 说明：文件实际存储由 multer 中间件处理，本层负责校验与URL拼接
 */

'use strict';

const { logger } = require('../utils/logger');
const {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} = require('../constants/upload-constants');
const uploadDao = require('../dao/upload-dao');

const MODULE = 'upload-service';

/**
 * 函数功能：校验上传文件的合法性
 * 入参：file（对象）- multer 解析后的文件对象，requestId（字符串）
 * 出参：{ valid: boolean, message: string }
 */
function validateFile(file, requestId) {
  if (!file) {
    logger.warn({ module: MODULE, operate: 'validate-file', result: '未接收到文件', requestId });
    return { valid: false, message: '未接收到文件' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    logger.warn({
      module: MODULE,
      operate: 'validate-file',
      params: { mimetype: file.mimetype },
      result: '文件类型不支持',
      requestId,
    });
    return { valid: false, message: '仅支持 JPG、PNG、WEBP 格式' };
  }

  if (file.size > MAX_FILE_SIZE) {
    logger.warn({
      module: MODULE,
      operate: 'validate-file',
      params: { size: file.size },
      result: '文件超过大小限制',
      requestId,
    });
    return { valid: false, message: '文件大小不能超过 5MB' };
  }

  return { valid: true, message: '' };
}

/**
 * 函数功能：根据已保存的文件名生成可公网访问的完整URL
 * 入参：filename（字符串）- multer 保存后的文件名
 * 出参：string - 完整访问URL
 */
function buildFileUrl(filename) {
  const baseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}/uploads/${filename}`;
}

/**
 * 函数功能：处理文件上传核心逻辑，校验文件并返回访问URL
 * 入参：file（对象）- multer 解析后的文件对象，requestId（字符串），userId（字符串，可选），fileType（字符串，可选）
 * 出参：{ success: boolean, url?: string, message: string }
 */
async function handleUpload(file, requestId, userId = null, fileType = 'general') {
  const validation = validateFile(file, requestId);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const url = buildFileUrl(file.filename);

  logger.info({
    module: MODULE,
    operate: 'upload-file',
    params: { originalname: file.originalname, size: file.size, mimetype: file.mimetype },
    result: `上传成功，文件名: ${file.filename}`,
    requestId,
  });

  if (userId) {
    await uploadDao.saveFileRecord({
      userId,
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      requestId,
    });

    if (fileType === 'avatar') {
      await uploadDao.updateUserAvatar(userId, url, requestId);
    }
  }

  return { success: true, url, message: '上传成功' };
}

module.exports = { handleUpload };

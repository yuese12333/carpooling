/**
 * 文件功能：文件上传业务逻辑层，负责文件合法性校验与公网访问URL生成
 * 关联业务：用户头像上传、车辆照片上传
 * 说明：文件实际存储由 multer 中间件处理，本层负责校验与URL拼接
 *       URL与用户的关联需等数据库模块完成后在此预留位置对接
 */

'use strict';

const { logger } = require('../utils/logger');

const MODULE = 'upload-service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 函数功能：校验上传文件的合法性
 * 入参：file（对象）- multer 解析后的文件对象，requestId（字符串）
 * 出参：{ valid: boolean, message: string }
 */
function validateFile(file, requestId) {
  if (!file) {
    logger.warn({ module: MODULE, operate: '文件校验', result: '未接收到文件', requestId });
    return { valid: false, message: '未接收到文件' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    logger.warn({
      module: MODULE,
      operate: '文件校验',
      params: { mimetype: file.mimetype },
      result: '文件类型不支持',
      requestId,
    });
    return { valid: false, message: '仅支持 JPG、PNG、WEBP 格式' };
  }

  if (file.size > MAX_FILE_SIZE) {
    logger.warn({
      module: MODULE,
      operate: '文件校验',
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
 * 入参：file（对象）- multer 解析后的文件对象，requestId（字符串）
 * 出参：{ success: boolean, url?: string, message: string }
 * 说明：URL与用户的绑定（如头像）预留此处，等数据库模块完成后在此调用 dao 层写入
 */
async function handleUpload(file, requestId) {
  const validation = validateFile(file, requestId);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const url = buildFileUrl(file.filename);

  logger.info({
    module: MODULE,
    operate: '文件上传',
    params: { originalname: file.originalname, size: file.size, mimetype: file.mimetype },
    result: `上传成功，URL: ${url}`,
    requestId,
  });

  // TODO: 数据库模块完成后，在此调用 dao 层将 url 关联到对应用户
  // await uploadDao.saveFileRecord({ userId, url, filename: file.filename, requestId });

  return { success: true, url, message: '上传成功' };
}

module.exports = { handleUpload };

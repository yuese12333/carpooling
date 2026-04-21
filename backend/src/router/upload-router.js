/**
 * 文件功能：文件上传路由层，定义上传接口路径与请求方法
 * 关联业务：用户头像上传、车辆照片上传
 * 说明：multer 在此层配置并挂载，仅处理 multipart/form-data 的单文件字段 file
 */

'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const { uploadFileController } = require('../controller/upload-controller');
const { buildFailureResponse, createRequestId } = require('../utils/response');
const { logger } = require('../utils/logger');
const {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} = require('../constants/upload-constants');

const router = express.Router();
const MODULE = 'upload-router';
const ALLOWED_MIME_TYPE_SET = new Set(ALLOWED_MIME_TYPES);
const ALLOWED_EXTENSION_SET = new Set(ALLOWED_EXTENSIONS);

function createUploadValidationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// 文件存储配置：保存到 backend/uploads/ 目录，文件名加随机后缀防冲突
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9.]/g, '');

    if (!ALLOWED_EXTENSION_SET.has(ext)) {
      return cb(createUploadValidationError('UNSUPPORTED_EXTENSION', '仅支持 JPG、PNG、WEBP 格式'));
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPE_SET.has(file.mimetype)) {
      return cb(createUploadValidationError('UNSUPPORTED_MIME_TYPE', '仅支持 JPG、PNG、WEBP 格式'));
    }
    return cb(null, true);
  },
});

function handleSingleFileUpload(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();
  upload.single('file')(req, res, (err) => {
    if (!err) return uploadFileController(req, res);

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      logger.warn({
        module: MODULE,
        operate: 'upload-file',
        result: '文件大小超过 5MB',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '文件大小不能超过 5MB', null, requestId));
    }

    if (
      err?.code === 'UNSUPPORTED_EXTENSION' ||
      err?.code === 'UNSUPPORTED_MIME_TYPE'
    ) {
      logger.warn({
        module: MODULE,
        operate: 'upload-file',
        result: '仅支持 JPG、PNG、WEBP 格式',
        requestId,
      });
      return res.status(400).json(buildFailureResponse(400, '仅支持 JPG、PNG、WEBP 格式', null, requestId));
    }

    logger.error({
      module: MODULE,
      operate: 'upload-file',
      error: err.message,
      errorType: err.name || 'UploadMiddlewareError',
      requestId,
    });
    return res.status(500).json(buildFailureResponse(500, '上传失败，请稍后重试', null, requestId));
  });
}

router.post('/file', handleSingleFileUpload);
// 兼容旧路径，后续前端切换完成后可移除
router.post('/upload', handleSingleFileUpload);

module.exports = router;

/**
 * 文件功能：文件上传控制层，负责接收请求、调用上传服务、返回标准响应
 * 关联业务：用户头像上传、车辆照片上传
 * 说明：multer 中间件在路由层挂载，控制层直接读取 req.file
 */

'use strict';

const { handleUpload } = require('../service/upload-service');
const { buildSuccessResponse, buildFailureResponse, createRequestId } = require('../utils/response');
const { logger } = require('../utils/logger');

const MODULE = 'upload-controller';

/**
 * 函数功能：处理单文件上传请求
 * 入参：req.file（multer 解析的文件）、req.headers['x-request-id']（链路ID）
 * 出参：标准响应体，成功返回 { url }，失败返回错误信息
 */
async function uploadFileController(req, res) {
  const requestId = req.headers['x-request-id'] || createRequestId();

  try {
    const result = await handleUpload(req.file, requestId);

    if (!result.success) {
      return res.status(400).json(
        buildFailureResponse(400, result.message, null, requestId)
      );
    }

    return res.json(
      buildSuccessResponse({ url: result.url }, requestId)
    );
  } catch (err) {
    logger.error({
      module: MODULE,
      operate: 'upload-file',
      error: err.message,
      errorType: '服务异常',
      requestId,
    });
    return res.status(500).json(
      buildFailureResponse(500, '上传失败，请稍后重试', null, requestId)
    );
  }
}

module.exports = { uploadFileController };

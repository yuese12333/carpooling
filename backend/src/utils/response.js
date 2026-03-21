const crypto = require('crypto');

/**
 * 函数功能：生成全链路请求ID
 * 出参：string（RN-开头的唯一标识）
 */
function createRequestId() {
  return `RN-${crypto.randomUUID()}`;
}

/**
 * 函数功能：构造标准成功响应体
 * 入参：data（业务数据）、requestId（链路ID）
 * 出参：统一成功结构
 */
function buildSuccessResponse(data, requestId) {
  return {
    code: 200,
    message: '操作成功',
    data,
    requestId,
  };
}

/**
 * 函数功能：构造标准失败响应体
 * 入参：code/message/data/requestId
 * 出参：统一失败结构
 */
function buildFailureResponse(code, message, data, requestId) {
  return {
    code,
    message,
    data,
    requestId,
  };
}

module.exports = {
  createRequestId,
  buildSuccessResponse,
  buildFailureResponse,
};


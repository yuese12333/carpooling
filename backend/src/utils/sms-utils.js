/**
 * 文件功能：短信工具（mock）
 * 关联业务：发送登录模块验证码
 */

function generateCode(length = 6) {
  const size = Math.max(Number(length) || 6, 4);
  let code = '';
  for (let i = 0; i < size; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

async function sendCode({ phone, code, type, requestId }) {
  return {
    requestId: `sms_req_${Date.now()}`,
    phone,
    type,
    code,
    upstreamRequestId: requestId,
  };
}

module.exports = {
  generateCode,
  sendCode,
};

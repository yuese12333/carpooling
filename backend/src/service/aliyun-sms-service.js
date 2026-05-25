/**
 * 文件功能：阿里云短信验证码服务层
 * 关联业务：短信验证码发送与校验
 * 说明：封装三方 SDK 调用，供 controller 统一编排
 */
const Dypnsapi20170525Module = require('@alicloud/dypnsapi20170525');
const { $OpenApiUtil } = require('@alicloud/openapi-core');
const CredentialModule = require('@alicloud/credentials');

const ClientClass = Dypnsapi20170525Module.default || Dypnsapi20170525Module;
const SendSmsVerifyCodeRequest = Dypnsapi20170525Module.SendSmsVerifyCodeRequest;
const CheckSmsVerifyCodeRequest = Dypnsapi20170525Module.CheckSmsVerifyCodeRequest;

let aliyunClient;

function omitEmptyFields(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

/**
 * 函数功能：懒加载创建阿里云短信 SDK 客户端
 * 入参：无
 * 出参：阿里云 SDK Client 实例
 * 说明：凭据由服务端环境变量提供，禁止在代码中硬编码密钥
 */
function getAliyunClient() {
  if (aliyunClient) return aliyunClient;

  const CredentialClass = CredentialModule.default || CredentialModule;
  const credential = new CredentialClass();

  const config = new $OpenApiUtil.Config({ credential });
  config.endpoint = 'dypnsapi.aliyuncs.com';

  aliyunClient = new ClientClass(config);
  return aliyunClient;
}

/**
 * 函数功能：调用阿里云发送短信验证码
 * 入参：sendVerifyCode 请求参数对象
 * 出参：标准化三方结果对象（包含 success/code/message 等）
 * 异常场景：SDK 调用抛错时由上层 controller 捕获
 */
async function sendVerifyCode({
  phoneNumber,
  signName,
  templateCode,
  templateParam,
  schemeName,
  validTime,
  interval,
  codeLength,
  codeType,
  duplicatePolicy,
  outId,
  returnVerifyCode,
  smsUpExtendCode,
}) {
  const client = getAliyunClient();

  const request = new SendSmsVerifyCodeRequest(
    omitEmptyFields({
      phoneNumber,
      signName,
      templateCode,
      templateParam,
      schemeName,
      validTime,
      interval,
      codeLength,
      codeType,
      duplicatePolicy,
      outId,
      returnVerifyCode,
      smsUpExtendCode,
    }),
  );

  const response = await client.sendSmsVerifyCode(request);
  const responseBody = response?.body;

  return {
    success: responseBody?.success,
    aliyunCode: responseBody?.code,
    aliyunMessage: responseBody?.message,
    accessDeniedDetail: responseBody?.accessDeniedDetail,
    requestId: responseBody?.requestId,
    verifyCode: responseBody?.model?.verifyCode,
  };
}

/**
 * 函数功能：调用阿里云校验短信验证码
 * 入参：checkVerifyCode 请求参数对象
 * 出参：标准化三方结果对象（包含 success/verifyResult 等）
 * 异常场景：SDK 调用抛错时由上层 controller 捕获
 */
async function checkVerifyCode({
  phoneNumber,
  verifyCode,
  schemeName,
  caseAuthPolicy,
  outId,
}) {
  const client = getAliyunClient();

  const request = new CheckSmsVerifyCodeRequest(
    omitEmptyFields({
      phoneNumber,
      verifyCode,
      schemeName,
      caseAuthPolicy,
      outId,
    }),
  );

  const response = await client.checkSmsVerifyCode(request);
  const responseBody = response?.body;

  return {
    success: responseBody?.success,
    aliyunCode: responseBody?.code,
    aliyunMessage: responseBody?.message,
    requestId: responseBody?.requestId,
    verifyResult: responseBody?.model?.verifyResult,
  };
}

module.exports = {
  sendVerifyCode,
  checkVerifyCode,
};


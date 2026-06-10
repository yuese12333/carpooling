/**
 * 端到端联调脚本
 * 用法：
 *   node scripts/e2e-public.js <phone> <password>
 *   node scripts/e2e-public.js 19900000099 Test1234
 *
 * 默认请求公网 http://1.15.45.125；可通过 BASE_URL 环境变量覆盖：
 *   BASE_URL=http://localhost:3000 node scripts/e2e-public.js 19900000099 Test1234
 *
 * 功能：登录拿 token，串跑 A 类 + 新增 B 类接口，输出每条结果与最终通过/失败统计
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE = process.env.BASE_URL || 'http://1.15.45.125';
const [, , phoneArg, pwdArg] = process.argv;
if (!phoneArg || !pwdArg) {
  console.error('用法：node scripts/e2e-public.js <phone> <password>');
  process.exit(2);
}

let token = '';
const results = [];

function send(method, path, body) {
  return new Promise((resolve) => {
    const u = new URL(BASE + path);
    const lib = u.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': `E2E-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
        timeout: 10000,
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(buf); } catch (e) { parsed = buf; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', (err) => resolve({ status: 0, body: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
    if (data) req.write(data);
    req.end();
  });
}

function record(name, res, expectOk = true) {
  const okHttp = res.status >= 200 && res.status < 300;
  const okBiz = res?.body?.code === 200;
  const pass = expectOk ? (okHttp && okBiz) : true;
  const tag = pass ? 'PASS' : 'FAIL';
  const codeMsg = res?.body?.code !== undefined ? `code=${res.body.code} msg=${res.body.message}` : '';
  console.log(`[${tag}] ${name} -> http=${res.status} ${codeMsg}`);
  if (!pass) console.log('       body:', JSON.stringify(res.body).slice(0, 300));
  results.push({ name, pass });
  return res;
}

(async () => {
  console.log('BASE =', BASE);
  console.log('phone =', phoneArg);

  // 0) health
  record('GET /health', await send('GET', '/health'), false);

  // 1) 登录
  const login = await send('POST', '/api/auth/login/password', { phone: phoneArg, password: pwdArg, rememberMe: false });
  record('POST /api/auth/login/password', login);
  token = login?.body?.data?.token;
  if (!token) { console.error('登录失败，停止后续测试'); process.exit(1); }
  console.log('token = ', token.slice(0, 24) + '...');

  // 2) 用户信息
  record('GET /api/users/me',                await send('GET', '/api/users/me'));
  record('GET /api/users/me/auth-status',    await send('GET', '/api/users/me/auth-status'));
  record('GET /api/users/me/invite',         await send('GET', '/api/users/me/invite'));

  // 3) 首页
  record('GET /api/home/user-info',                 await send('GET', '/api/home/user-info'));
  record('GET /api/home/rides/recommend',           await send('GET', '/api/home/rides/recommend'));
  record('GET /api/home/statistics',                await send('GET', '/api/home/statistics'));
  record('GET /api/home/notifications/unread-status', await send('GET', '/api/home/notifications/unread-status'));

  // 4) 通知
  record('GET /api/notifications', await send('GET', '/api/notifications'));

  // 5) 找车 / 发布
  record('GET /api/rides/search-metadata',    await send('GET', '/api/rides/search-metadata'));
  record('GET /api/rides/search',             await send('GET', '/api/rides/search?fromText=%E4%B8%8A%E6%B5%B7%E8%99%B9%E6%A1%A5%E6%9C%BA%E5%9C%BA&toText=%E4%B8%8A%E6%B5%B7%E9%99%86%E5%AE%B6%E5%98%B4&departDate=2026-06-15'));
  record('GET /api/rides/publish-config',     await send('GET', '/api/rides/publish-config'));
  record('GET /api/rides/publish-permission', await send('GET', '/api/rides/publish-permission'));

  // 6) 我的行程
  record('GET /api/trips/list?type=passenger',     await send('GET', '/api/trips/list?type=passenger'));
  record('GET /api/trips/template',                await send('GET', '/api/trips/template'));
  record('GET /api/trips/cancel-reasons?type=passenger', await send('GET', '/api/trips/cancel-reasons?type=passenger'));

  // 7) 个人中心
  record('GET /api/profile/info',                  await send('GET', '/api/profile/info'));
  record('GET /api/profile/car',                   await send('GET', '/api/profile/car'));
  record('GET /api/profile/badges',                await send('GET', '/api/profile/badges'));
  record('GET /api/profile/frequent-locations',    await send('GET', '/api/profile/frequent-locations'));
  record('GET /api/profile/notification-settings', await send('GET', '/api/profile/notification-settings'));
  // 8) 支付（含新接口）
  record('GET /api/payments/balance',        await send('GET', '/api/payments/balance'));
  record('GET /api/payments/history',        await send('GET', '/api/payments/history'));
  record('GET /api/payments/methods',        await send('GET', '/api/payments/methods'));        // NEW
  record('GET /api/payments/stats/monthly',  await send('GET', '/api/payments/stats/monthly'));  // NEW

  // 9) 公共
  record('GET /api/common/location/suggestions?keyword=机场', await send('GET', '/api/common/location/suggestions?keyword=%E6%9C%BA%E5%9C%BA'));
  record('GET /api/common/config',  await send('GET', '/api/common/config'));
  record('GET /api/common/protocol', await send('GET', '/api/common/protocol?type=user-agreement'));

  // 10) 帮助（含新接口）
  record('GET /api/help/categories', await send('GET', '/api/help/categories'));
  record('GET /api/help/questions',  await send('GET', '/api/help/questions'));                  // NEW

  // 11) 实名提交（NEW，已通过则会 409）
  const verifyRes = await send('POST', '/api/users/me/auth/verify', { name: '张三', idNumber: '11010119900307123X' });
  if (verifyRes.status === 409 || verifyRes?.body?.code === 409) {
    console.log('[PASS] POST /api/users/me/auth/verify -> http=409 (已认证，跳过)');
    results.push({ name: 'POST /api/users/me/auth/verify', pass: true });
  } else {
    record('POST /api/users/me/auth/verify', verifyRes);
  }

  // 总结
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  console.log('\n========== SUMMARY ==========');
  console.log(`通过 ${passed}/${total}`);
  if (passed !== total) {
    console.log('失败列表:');
    results.filter((r) => !r.pass).forEach((r) => console.log('  - ' + r.name));
    process.exit(1);
  }
})();

const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async function run() {
  const host = 'localhost';
  const port = 3005;

  console.log('1) Skipping registration (test user already created via create-test-user.js)');
  
  console.log('2) Logging in...');
  let res = await request({ hostname: host, port, path: '/api/auth/login/password', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { phone: '19900000001', password: 'Test1234' });
  console.log('login:', res.status, JSON.stringify(res.body));
  const token = res.body?.data?.token || (res.body && res.body.token) || (res.body && res.body.data && res.body.data.token);
  if (!token) {
    console.error('No token received; aborting further tests');
    process.exit(1);
  }

  const authHeader = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };

  console.log('4) GET /api/users/me');
  res = await request({ hostname: host, port, path: '/api/users/me', method: 'GET', headers: authHeader });
  console.log('/api/users/me ->', res.status, JSON.stringify(res.body));

  console.log('5) GET /api/trips/cancel-reasons?type=passenger');
  res = await request({ hostname: host, port, path: '/api/trips/cancel-reasons?type=passenger', method: 'GET', headers: authHeader });
  console.log('/api/trips/cancel-reasons ->', res.status, JSON.stringify(res.body));

  console.log('6) GET /api/payments/balance');
  res = await request({ hostname: host, port, path: '/api/payments/balance', method: 'GET', headers: authHeader });
  console.log('/api/payments/balance ->', res.status, JSON.stringify(res.body));

  console.log('7) POST /api/users/me/track-share');
  res = await request({ hostname: host, port, path: '/api/users/me/track-share', method: 'POST', headers: authHeader }, { platform: 'wechat' });
  console.log('/api/users/me/track-share ->', res.status, JSON.stringify(res.body));

  console.log('8) GET /api/payments/history');
  res = await request({ hostname: host, port, path: '/api/payments/history', method: 'GET', headers: authHeader });
  console.log('/api/payments/history ->', res.status, JSON.stringify(res.body));

  process.exit(0);
})();

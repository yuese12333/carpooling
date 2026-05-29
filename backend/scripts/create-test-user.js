const usersService = require('../src/service/users-service');

(async function() {
  try {
    const res = await usersService.registerUser({ phone: '19900000001', nickname: 'smoketest', password: 'Test1234' }, 'smoke-create');
    console.log('create-user result:', res);
  } catch (err) {
    console.error('create-user error:', err.message || err);
  }
})();

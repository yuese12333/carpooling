const prisma = require('../src/config/prisma');

(async () => {
  try {
    const user = await prisma.authUser.findUnique({ where: { phone: '19900000001' } });
    if (!user) {
      console.log('user not found');
    } else {
      console.log('user found:', {
        user_id: user.user_id,
        phone: user.phone,
        user_name: user.user_name,
        status: user.status,
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('query error', err.message || err);
    process.exit(2);
  }
})();

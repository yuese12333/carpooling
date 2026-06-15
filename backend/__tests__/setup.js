/**
 * Jest 测试环境设置
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.DATABASE_URL = 'mysql://root:test@localhost:3306/carpooling_test';

jest.setTimeout(10000);

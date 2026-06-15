/**
 * 公共服务测试
 */
const commonService = require('../../src/service/common-service');
const commonDao = require('../../src/dao/common-dao');

jest.mock('../../src/dao/common-dao');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Common Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLocationSuggestions', () => {
    it('should return location suggestions', async () => {
      const mockSuggestions = [
        { name: '北京站', address: '北京市东城区', latitude: 39.9, longitude: 116.4 },
      ];
      commonDao.searchLocations.mockResolvedValue(mockSuggestions);

      const result = await commonService.getLocationSuggestions({
        keyword: '北京站',
        city: '北京',
        requestId: 'test-request-id',
      });

      expect(result.suggestions).toBeDefined();
    });
  });

  describe('getProtocol', () => {
    it('should return protocol content', async () => {
      const mockProtocol = {
        type: 'user-agreement',
        title: '用户服务协议',
        content: '协议内容...',
        version: '1.0.0',
        updated_at: new Date(),
      };
      commonDao.getProtocolByType.mockResolvedValue(mockProtocol);

      const result = await commonService.getProtocol({
        type: 'user-agreement',
        requestId: 'test-request-id',
      });

      expect(result.type).toBe('user-agreement');
      expect(result.title).toBe('用户服务协议');
    });
  });

  describe('getConfig', () => {
    it('should return config values', async () => {
      const mockConfigs = [
        { config_key: 'app_version', config_value: '1.0.0', description: '应用版本' },
      ];
      commonDao.getConfigs.mockResolvedValue(mockConfigs);

      const result = await commonService.getConfig({
        keys: ['app_version'],
        requestId: 'test-request-id',
      });

      expect(result.configs.app_version).toBeDefined();
      expect(result.configs.app_version.value).toBe('1.0.0');
    });
  });

  describe('reportEventLog', () => {
    it('should create event log', async () => {
      commonDao.createEventLog.mockResolvedValue({ success: true });

      const result = await commonService.reportEventLog({
        userId: 'user_001',
        eventType: 'page_view',
        eventData: { page: 'home' },
        requestId: 'test-request-id',
      });

      expect(result.success).toBe(true);
    });
  });
});

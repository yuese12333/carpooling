import Constants from 'expo-constants';

/**
 * 后端 API 根地址。
 * - 开发环境：内网地址（.env 中 EXPO_PUBLIC_API_URL 或默认 http://localhost:3000）
 * - 测试环境：公网服务器地址（.env 中 EXPO_PUBLIC_API_URL 设为公网 URL）
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) || 'http://localhost:3000';

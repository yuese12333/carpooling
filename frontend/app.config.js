// 加载 .env，便于通过 EXPO_PUBLIC_API_URL 区分开发（内网）与测试（公网）
require('dotenv').config();

const { expo } = require('./app.json');

module.exports = {
  expo: {
    ...expo,
    // prebuild 需要显式声明；动态 config 下 Expo 无法自动写入
    android: {
      ...expo.android,
      package: 'com.anonymous.carpooling',
    },
    ios: {
      ...expo.ios,
      bundleIdentifier: 'com.anonymous.carpooling',
    },
    extra: {
      // 开发环境用内网地址，测试环境用公网地址；未设置时默认本地
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    },
  },
};

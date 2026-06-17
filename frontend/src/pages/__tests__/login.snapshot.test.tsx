/**
 * @file login.snapshot.test.tsx
 * @description 登录页面快照测试
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock hooks
jest.mock('@/hooks/use-login-form', () => ({
  useLoginForm: () => ({
    state: {
      phone: '',
      password: '',
      shouldRemember: false,
      isLoading: false,
      errors: { phone: '', password: '', submission: '' },
    },
    actions: {
      setPhone: jest.fn(),
      setPassword: jest.fn(),
      setShouldRemember: jest.fn(),
      handleLogin: jest.fn(),
    },
  }),
}));

jest.mock('@/store/env-store', () => ({
  useEnvStore: jest.fn(() => ({
    isMockMode: true,
    toggleMockMode: jest.fn(),
  })),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  generateRequestId: () => 'test-request-id',
}));

jest.mock('@/utils/sync-request-id', () => ({
  syncRequestId: jest.fn(),
}));

jest.mock('@/api/auth', () => ({
  fetchLoginConfig: jest.fn(() => Promise.resolve({
    success: true,
    data: {
      title: '欢迎登录',
      subtitle: '拼车出行，安全便捷',
      activeSocialPlatforms: ['wechat', 'qq'],
    },
  })),
}));

// Mock components - 返回实际的 React 组件
jest.mock('@/components/button', () => {
  const React = require('react');
  return { Button: (props) => React.createElement('Button', props, props.children) };
});

jest.mock('@/components/checkbox', () => {
  const React = require('react');
  return { Checkbox: (props) => React.createElement('Checkbox', props) };
});

jest.mock('@/components/separator', () => {
  const React = require('react');
  return { Separator: (props) => React.createElement('Separator', props) };
});

jest.mock('@/components/label', () => {
  const React = require('react');
  return { Label: (props) => React.createElement('Label', props, props.children) };
});

jest.mock('@/components/alert', () => {
  const React = require('react');
  return { Alert: (props) => React.createElement('Alert', props, props.children) };
});

jest.mock('@/components/language-switch', () => {
  const React = require('react');
  return { LanguageSwitch: (props) => React.createElement('LanguageSwitch', props) };
});

jest.mock('@/pages/auth/login/components/social-channel-item', () => {
  const React = require('react');
  return { SocialChannelItem: (props) => React.createElement('SocialChannelItem', props) };
});

// 导入页面组件
import LoginPage from '@/pages/auth/login/login';

describe('LoginPage', () => {
  test('页面正确渲染', () => {
    const { toJSON } = render(<LoginPage />);
    expect(toJSON()).toBeTruthy();
  });

  test('快照测试', () => {
    const { toJSON } = render(<LoginPage />);
    expect(toJSON()).toMatchSnapshot();
  });
});

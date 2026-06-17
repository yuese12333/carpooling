/**
 * @file home.snapshot.test.tsx
 * @description 首页快照测试
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock hooks
jest.mock('@/hooks/use-home-form', () => ({
  useHomeForm: () => ({
    fromLocation: '',
    setFromLocation: jest.fn(),
    toLocation: '',
    setToLocation: jest.fn(),
    selectedDate: new Date('2024-01-01'),
    userInfo: { name: '测试用户', phone: '138****8000' },
    stats: { totalRides: 10, savedCarbon: 50, savedMoney: 100 },
    hasUnread: false,
    isMockMode: true,
    featuredRides: [],
    toggleMockMode: jest.fn(),
    handleSearch: jest.fn(),
    navigateTo: jest.fn(),
  }),
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  generateRequestId: () => 'test-request-id',
}));

// Mock components
jest.mock('@/pages/home/components/home-header', () => {
  const React = require('react');
  return { HomeHeader: (props) => React.createElement('HomeHeader', props) };
});

jest.mock('@/pages/home/components/ride-card-item', () => {
  const React = require('react');
  return { RideCardItem: (props) => React.createElement('RideCardItem', props) };
});

jest.mock('@/pages/home/components/stats-banner', () => {
  const React = require('react');
  return { StatsBanner: (props) => React.createElement('StatsBanner', props) };
});

jest.mock('@/pages/home/components/quick-actions', () => {
  const React = require('react');
  return { QuickActions: (props) => React.createElement('QuickActions', props) };
});

// 导入页面组件
import HomePage from '@/pages/home/home';

describe('HomePage', () => {
  test('页面正确渲染', () => {
    const { toJSON } = render(<HomePage />);
    expect(toJSON()).toBeTruthy();
  });

  test('快照测试', () => {
    const { toJSON } = render(<HomePage />);
    expect(toJSON()).toMatchSnapshot();
  });
});

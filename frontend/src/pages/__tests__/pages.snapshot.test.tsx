/**
 * @file pages.snapshot.test.tsx
 * @description 批量页面快照测试 - 用最小成本给所有页面补快照覆盖
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// ── 统一 Mock 常见依赖 ────────────────────────────────────────────────

// expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
  Link: 'Link',
  Stack: { Screen: 'Screen' },
}));

// React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

// Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// 网络请求
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ code: 0, data: [], message: 'ok' }),
  })
);

// AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// NativeWind
jest.mock('nativewind', () => ({
  styled: (Component: React.ComponentType) => Component,
  cssInterop: (Component: React.ComponentType) => Component,
}));

jest.mock('react-native-css-interop', () => ({
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  cssInterop: (Component: React.ComponentType) => Component,
}));

// Lucide icons
jest.mock('lucide-react-native', () => ({
  ChevronRight: () => 'ChevronRight',
  ChevronLeft: () => 'ChevronLeft',
  ArrowLeft: () => 'ArrowLeft',
  ArrowRight: () => 'ArrowRight',
  SlidersHorizontal: () => 'SlidersHorizontal',
  Shield: () => 'Shield',
  Star: () => 'Star',
  Zap: () => 'Zap',
  User: () => 'User',
  Phone: () => 'Phone',
  Mail: () => 'Mail',
  Lock: () => 'Lock',
  Eye: () => 'Eye',
  EyeOff: () => 'EyeOff',
  MapPin: () => 'MapPin',
  Calendar: () => 'Calendar',
  Clock: () => 'Clock',
  Car: () => 'Car',
  Users: () => 'Users',
  Bell: () => 'Bell',
  Settings: () => 'Settings',
  LogOut: () => 'LogOut',
  Plus: () => 'Plus',
  X: () => 'X',
  Check: () => 'Check',
  Search: () => 'Search',
  Filter: () => 'Filter',
  AlertCircle: () => 'AlertCircle',
  Info: () => 'Info',
  HelpCircle: () => 'HelpCircle',
  MessageCircle: () => 'MessageCircle',
  Heart: () => 'Heart',
  Home: () => 'Home',
  Briefcase: () => 'Briefcase',
  CreditCard: () => 'CreditCard',
  Wallet: () => 'Wallet',
  Gift: () => 'Gift',
  Share2: () => 'Share2',
  Globe: () => 'Globe',
  Navigation: () => 'Navigation',
  Locate: () => 'Locate',
  DollarSign: () => 'DollarSign',
  Send: () => 'Send',
  Camera: () => 'Camera',
  Image: () => 'Image',
  FileText: () => 'FileText',
  Trash2: () => 'Trash2',
  Edit: () => 'Edit',
  MoreVertical: () => 'MoreVertical',
  ShieldCheck: () => 'ShieldCheck',
}));

// Utils
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  generateRequestId: () => 'test-request-id',
}));

jest.mock('@/utils/sync-request-id', () => ({
  syncRequestId: jest.fn(),
}));

// Store
jest.mock('@/store/env-store', () => ({
  useEnvStore: jest.fn(() => ({
    isMockMode: true,
    toggleMockMode: jest.fn(),
    requestId: 'test-request-id',
    setRequestId: jest.fn(),
    token: null,
    setToken: jest.fn(),
    refreshToken: null,
    setRefreshToken: jest.fn(),
    role: null,
    setRole: jest.fn(),
  })),
}));

// AuthContext mock
jest.mock('@/store/auth-context', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Hooks
jest.mock('@/hooks/use-home-form', () => ({
  useHomeForm: () => ({
    fromLocation: '',
    setFromLocation: jest.fn(),
    toLocation: '',
    setToLocation: jest.fn(),
    selectedDate: '2024-01-01',
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

jest.mock('@/hooks/use-register-form', () => ({
  useRegisterForm: () => ({
    state: {
      step: 1,
      nickname: '',
      phone: '',
      code: '',
      password: '',
      confirmPassword: '',
      agreeProtocol: false,
      codeCountdown: 0,
      isLoading: false,
      errors: {},
      passwordStrength: { score: 0, label: '弱', color: '#ff4d4f' },
    },
    actions: {
      setNickname: jest.fn(),
      setPhone: jest.fn(),
      setCode: jest.fn(),
      setPassword: jest.fn(),
      setConfirmPassword: jest.fn(),
      setAgreeProtocol: jest.fn(),
      sendCode: jest.fn(),
      nextStep: jest.fn(),
      prevStep: jest.fn(),
      submit: jest.fn(),
    },
  }),
}));

// Components - mock 全局组件（@ 别名路径，映射到根目录 components/）
// 注意：createMockComponent 必须在 jest.mock 回调内部定义，因为 Jest 会提升 mock 调用
jest.mock('@/components/button', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Button: createMockComponent('Button') };
});
jest.mock('@/components/checkbox', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Checkbox: createMockComponent('Checkbox') };
});
jest.mock('@/components/separator', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Separator: createMockComponent('Separator') };
});
jest.mock('@/components/label', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Label: createMockComponent('Label') };
});
jest.mock('@/components/alert', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Alert: createMockComponent('Alert') };
});
jest.mock('@/components/input', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Input: createMockComponent('Input') };
});
jest.mock('@/components/card', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Card: createMockComponent('Card') };
});
jest.mock('@/components/progress', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Progress: createMockComponent('Progress') };
});
jest.mock('@/components/switch', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Switch: createMockComponent('Switch') };
});
jest.mock('@/components/textarea', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Textarea: createMockComponent('Textarea') };
});
jest.mock('@/components/popover', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Popover: createMockComponent('Popover'), PopoverTrigger: createMockComponent('PopoverTrigger'), PopoverContent: createMockComponent('PopoverContent') };
});
jest.mock('@/components/sheet', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Sheet: createMockComponent('Sheet') };
});
jest.mock('@/components/tabs', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Tabs: createMockComponent('Tabs') };
});

// Avatar 和 Badge 组件
jest.mock('@/components/avatar', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return {
    Avatar: createMockComponent('Avatar'),
    AvatarImage: createMockComponent('AvatarImage'),
    AvatarFallback: createMockComponent('AvatarFallback'),
  };
});
jest.mock('@/components/badge', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { Badge: createMockComponent('Badge') };
});

// language-switch 在 src/components/ 下
jest.mock('@/components/language-switch', () => {
  const React = require('react');
  const createMockComponent = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  return { LanguageSwitch: createMockComponent('LanguageSwitch') };
});

// API mocks
jest.mock('@/api/auth', () => ({
  fetchLoginConfig: jest.fn(() => Promise.resolve({
    success: true,
    data: { title: '欢迎登录', subtitle: '拼车出行', activeSocialPlatforms: ['wechat'] },
  })),
  sendSmsCode: jest.fn(() => Promise.resolve({ success: true })),
  checkNickname: jest.fn(() => Promise.resolve({ isAvailable: true })),
}));

// Mock 页面子组件
jest.mock('../home/components/home-header', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { HomeHeader: c('HomeHeader') };
});
jest.mock('../home/components/ride-card-item', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { RideCardItem: c('RideCardItem') };
});
jest.mock('../home/components/stats-banner', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { StatsBanner: c('StatsBanner') };
});
jest.mock('../home/components/quick-actions', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { QuickActions: c('QuickActions') };
});
jest.mock('../auth/login/components/social-channel-item', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { SocialChannelItem: c('SocialChannelItem') };
});

// find-ride 子组件
jest.mock('../find-ride/components/search-bar', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { SearchBar: c('SearchBar') };
});
jest.mock('../find-ride/components/filter-tabs', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { FilterTabs: c('FilterTabs') };
});
jest.mock('../find-ride/components/sort-panel', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { SortPanel: c('SortPanel') };
});
jest.mock('../find-ride/components/ride-card', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { RideCard: c('RideCard') };
});

// trips 子组件
jest.mock('../trips/components/trip-header', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { TripHeader: c('TripHeader') };
});
jest.mock('../trips/components/trip-tab-bar', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { TripTabBar: c('TripTabBar') };
});
jest.mock('../trips/components/trip-card', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { TripCard: c('TripCard') };
});
jest.mock('../trips/components/trip-empty-state', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { TripEmptyState: c('TripEmptyState') };
});

// forget-password 子组件
jest.mock('../auth/forget-password/components/password-header', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { PasswordHeader: c('PasswordHeader') };
});
jest.mock('../auth/forget-password/components/step-phone-input', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { StepPhoneInput: c('StepPhoneInput') };
});
jest.mock('../auth/forget-password/components/step-verify-otp', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { StepVerifyOtp: c('StepVerifyOtp') };
});
jest.mock('../auth/forget-password/components/step-reset-password', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { StepResetPassword: c('StepResetPassword') };
});
jest.mock('../auth/forget-password/components/step-success', () => {
  const React = require('react');
  const c = (name: string) => (props: Record<string, unknown>) => React.createElement(name, props, props.children);
  return { StepSuccess: c('StepSuccess') };
});

// 额外的 hooks mock
jest.mock('@/hooks/use-forget-password-form', () => ({
  useForgetPasswordForm: () => ({
    step: 1,
    phone: '',
    code: [],
    password: '',
    confirmPwd: '',
    pwdStrength: 0,
    loading: false,
    errors: {},
    countdown: 0,
    showPwd: false,
    showConfirm: false,
    codeRefs: { current: [] },
    setStep: jest.fn(),
    setPhone: jest.fn(),
    setCode: jest.fn(),
    setPassword: jest.fn(),
    setConfirmPwd: jest.fn(),
    setShowPwd: jest.fn(),
    setShowConfirm: jest.fn(),
    setErrors: jest.fn(),
    handleCodeChange: jest.fn(),
    handleKeyDown: jest.fn(),
    handleInitiateReset: jest.fn(),
    verifySmsCode: jest.fn(),
    handleFinalSubmit: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-find-ride-form', () => ({
  useFindRideForm: () => ({
    searchFrom: '',
    searchTo: '',
    sortBy: '最快出发',
    activeFilters: ['today'],
    isSortDropdownVisible: false,
    loading: false,
    filteredRides: [],
    setSearchFrom: jest.fn(),
    setSearchTo: jest.fn(),
    handleSearch: jest.fn(),
    handleToggleFilter: jest.fn(),
    handleSelectSort: jest.fn(),
    toggleSortDropdown: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-trips-form', () => ({
  useTripsForm: () => ({
    state: {
      activeTab: '全部',
      activeRole: 'all',
      isListInitialLoading: false,
      filteredTrips: [],
      isMockMode: true,
    },
    actions: {
      setActiveTab: jest.fn(),
      setActiveRole: jest.fn(),
      handleFindRideNavigation: jest.fn(),
      handleViewTripDetail: jest.fn(),
      handleCancelTrip: jest.fn(),
      handleContactAction: jest.fn(),
    },
  }),
}));

jest.mock('@/api/find-ride-api', () => ({
  RIDE_SORT_OPTIONS: ['最快出发', '价格最低', '评分最高'],
  RIDE_FILTER_TAGS: [
    { label: '今天', value: 'today' },
    { label: '明天', value: 'tomorrow' },
  ],
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ── 页面清单 ────────────────────────────────────────────────────────
// 注：部分页面因依赖复杂或导入问题暂时跳过，后续可逐步修复
const PAGES = [
  { name: '首页 home', load: () => require('../home/home').default },
  { name: '登录页 login', load: () => require('../auth/login/login').default },
  // { name: '注册页 register', load: () => require('../auth/register/register').default }, // AuthContext 依赖
  { name: '找回密码 forget-password', load: () => require('../auth/forget-password/forget-password').default },
  { name: '找车页 find-ride', load: () => require('../find-ride/find-ride').default },
  // { name: '发布行程 offer-ride', load: () => require('../offer-ride/offer-ride').default }, // 地图依赖
  { name: '我的行程 trips', load: () => require('../trips/trips').default },
  // { name: '个人中心 profile', load: () => require('../profile/profile/profile').default }, // AuthContext 依赖
  { name: '我的车辆 my-vehicles', load: () => require('../profile/my-vehicles/my-vehicles').default },
  // { name: '常用地点 favorite-locations', load: () => require('../profile/favorite-locations/favorite-locations').default }, // 地图依赖
  // { name: '添加地点 add-location', load: () => require('../profile/add-location/add-location').default }, // 地图依赖
  // { name: '编辑地点 edit-location', load: () => require('../profile/edit-location/edit-location').default }, // 待补充 mock
  // { name: '车辆信息编辑 edit-vehicle', load: () => require('../profile/edit-vehicle-information/edit-vehicle-information').default }, // 待补充 mock
  // { name: '紧急联系人 emergency-contact', load: () => require('../profile/emergency-contact/emergency-contact').default }, // 待补充 mock
  // { name: '帮助中心 help-center', load: () => require('../profile/help-center/help-center').default }, // 待补充 mock
  { name: '邀请好友 invite-friends', load: () => require('../profile/invite-friends/invite-friends').default },
  { name: '语言设置 language-settings', load: () => require('../profile/language-settings/language-settings').default },
  // { name: '消息通知 notification', load: () => require('../profile/notification/notification').default }, // 待补充 mock
  // { name: '支付历史 payment-history', load: () => require('../profile/payment-history/payment-history').default }, // 待补充 mock
  // { name: '支付方式 payment-methods', load: () => require('../profile/payment-methods/payment-methods').default }, // 待补充 mock
  { name: '实名认证 real-name-auth', load: () => require('../profile/real-name-auth/real-name-auth').default },
  { name: '行程收据 receipt-detail', load: () => require('../profile/receipt-detail/receipt-detail').default },
  // { name: '安全中心 safety-center', load: () => require('../profile/safety-center/safety-center').default }, // 待补充 mock
  { name: '车辆认证详情 vehicle-verification', load: () => require('../profile/vehicle-verification-detail/vehicle-verification-detail').default },
  // { name: '行程导航 ride-navigation', load: () => require('../ride-navigation/ride-navigation').default }, // 地图依赖
];

// ── 批量生成快照 ────────────────────────────────────────────────────────
describe('页面快照（批量）', () => {
  PAGES.forEach(({ name, load }) => {
    test(`${name} 渲染快照`, () => {
      const Component = load();
      const tree = render(<Component />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});

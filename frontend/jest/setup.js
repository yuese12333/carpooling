/**
 * Jest 全局配置
 * 用于配置 React Native 和 Expo 模块的 mock
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  Link: 'Link',
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 39.9, longitude: 116.4 }
  })),
  watchPositionAsync: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: 'SafeAreaProvider',
}));

// Mock react-native-css-interop - 更彻底的 mock
jest.mock('react-native-css-interop', () => ({
  StyleSheet: {
    create: (styles) => styles,
  },
  cssInterop: (Component) => Component,
  // 添加运行时需要的函数
  createInteropElement: (element) => element,
  // 阻止运行时检查
  __esModule: true,
  default: {
    cssInterop: (Component) => Component,
  },
}));

// Mock react-native-css-interop/runtime
jest.mock('react-native-css-interop/src/runtime/wrap-jsx', () => ({
  wrapJSX: (element) => element,
}), { virtual: true });

jest.mock('react-native-css-interop/src/runtime/third-party-libs/react-native-safe-area-context.native', () => ({}), { virtual: true });

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component) => Component,
  cssInterop: (Component) => Component,
  View: 'View',
  Text: 'Text',
}));

// Mock nativewind/babel
jest.mock('nativewind/babel', () => ({}), { virtual: true });

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return prop;
    },
  });
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  return new Proxy({}, {
    get: function(target, prop) {
      return prop;
    },
  });
});

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

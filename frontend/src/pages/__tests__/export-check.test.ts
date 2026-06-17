/**
 * 测试页面组件导出
 */

// Mock 必要的依赖
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
  SafeAreaView: ({ children }) => children,
}));

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  generateRequestId: () => 'test-id',
}));

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
    setStep: jest.fn(),
    setPhone: jest.fn(),
    setCode: jest.fn(),
    setPassword: jest.fn(),
    setConfirmPwd: jest.fn(),
    setShowPwd: jest.fn(),
    setShowConfirm: jest.fn(),
    handleCodeChange: jest.fn(),
    handleKeyDown: jest.fn(),
    handleInitiateReset: jest.fn(),
    verifySmsCode: jest.fn(),
    handleFinalSubmit: jest.fn(),
    codeRefs: { current: [] },
    countdown: 0,
    showPwd: false,
    showConfirm: false,
    setErrors: jest.fn(),
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
  RIDE_SORT_OPTIONS: ['最快出发', '价格最低'],
  RIDE_FILTER_TAGS: [],
}));

// Mock 子组件
jest.mock('@/pages/find-ride/components/search-bar', () => ({
  SearchBar: () => null,
}));
jest.mock('@/pages/find-ride/components/filter-tabs', () => ({
  FilterTabs: () => null,
}));
jest.mock('@/pages/find-ride/components/sort-panel', () => ({
  SortPanel: () => null,
}));
jest.mock('@/pages/find-ride/components/ride-card', () => ({
  RideCard: () => null,
}));
jest.mock('@/pages/trips/components/trip-header', () => ({
  TripHeader: () => null,
}));
jest.mock('@/pages/trips/components/trip-tab-bar', () => ({
  TripTabBar: () => null,
}));
jest.mock('@/pages/trips/components/trip-card', () => null);
jest.mock('@/pages/trips/components/trip-empty-state', () => ({
  TripEmptyState: () => null,
}));
jest.mock('@/pages/auth/forget-password/components/password-header', () => ({
  PasswordHeader: () => null,
}));
jest.mock('@/pages/auth/forget-password/components/step-phone-input', () => ({
  StepPhoneInput: () => null,
}));
jest.mock('@/pages/auth/forget-password/components/step-verify-otp', () => ({
  StepVerifyOtp: () => null,
}));
jest.mock('@/pages/auth/forget-password/components/step-reset-password', () => ({
  StepResetPassword: () => null,
}));
jest.mock('@/pages/auth/forget-password/components/step-success', () => ({
  StepSuccess: () => null,
}));

describe('页面导出检查', () => {
  test('forget-password 有默认导出', () => {
    const mod = require('../auth/forget-password/forget-password');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('find-ride 有默认导出', () => {
    const mod = require('../find-ride/find-ride');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('trips 有默认导出', () => {
    const mod = require('../trips/trips');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

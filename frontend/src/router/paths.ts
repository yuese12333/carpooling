/**
 * @file 路由常量定义
 * @description 对应项目根目录下的 app/ (或 src/pages/) 结构
 */
export const ROUTES = {
    // 根层级
    INDEX: '/',
    HOME: '/home/home',
    FIND_RIDE: '/find-ride/find-ride',
    OFFER_RIDE: '/offer-ride/offer-ride',
    TRIPS: '/trips/trips',
    PROFILE_MAIN: '/profile',

    // 认证模块
    AUTH: {
        LOGIN: '/auth/login/login',
        REGISTER: '/auth/register/register',
        FORGET_PASSWORD: '/auth/forget-password/forget-password',
    },

    // 个人中心模块
    PROFILE: {
        FAVORITE_LOCATIONS: '/profile/favorite-locations',
        ADD_LOCATION: '/profile/add-location',
        EDIT_LOCATION: '/profile/edit-location',
        MY_VEHICLES: '/profile/my-vehicles',
        VEHICLE_VERIFICATION: '/profile/vehicle-verification-detail',
        PAYMENT_METHODS: '/profile/payment-methods',
        PAYMENT_HISTORY: '/profile/payment-history',
        RECEIPT_DETAIL: '/profile/receipt-detail',
    },

    // 行程/详情相关
    RIDE: {
        DETAIL: '/ride-detail',
        NAVIGATION: '/ride-navigation',
        ARRIVAL_CONFIRM: '/ride-arrival-confirm',
        DELAY_ALERT: '/ride-delay-alert',
    },

    // 测试
    MAP_TEST: '/map-test-page',
} as const;

// 定义路由类型，方便在组件中使用
export type AppRoute = typeof ROUTES;
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
    PROFILE_MAIN: '/profile/profile/profile',

    // 认证模块
    AUTH: {
        LOGIN: '/auth/login/login',
        REGISTER: '/auth/register/register',
        FORGET_PASSWORD: '/auth/forget-password/forget-password',
    },

    // 管理员模块（仅用于前端路由跳转/守卫）
    ADMIN: {
        LOGIN: '/admin/login',
        USERS: '/admin/users',
    },

    // 个人中心模块
    PROFILE: {
        FAVORITE_LOCATIONS: '/profile/favorite-locations/favorite-locations',
        ADD_LOCATION: '/profile/add-location/add-location',
        EDIT_LOCATION: '/profile/edit-location/edit-location',
        MY_VEHICLES: '/profile/my-vehicles/my-vehicles',
        VEHICLE_VERIFICATION: '/profile/vehicle-verification-detail/vehicle-verification-detail',
        EDIT_VEHICLE_INFORMATION: '/profile/edit-vehicle-information/edit-vehicle-information',
        PAYMENT_METHODS: '/profile/payment-methods/payment-methods',
        PAYMENT_HISTORY: '/profile/payment-history/payment-history',
        RECEIPT_DETAIL: '/profile/receipt-detail/receipt-detail',
        NOTIFICATION: '/profile/notification/notification',
        INVITE_FRIENDS: '/profile/invite-friends/invite-friends',
        REAL_NAME_AUTH: '/profile/real-name-auth/real-name-auth',
        HELP_CENTER: '/profile/help-center/help-center',
    },

    // 行程/详情相关
    RIDE: {
        DETAIL: '/ride/ride-detail',
        NAVIGATION: '/ride/ride-navigation',
        ARRIVAL_CONFIRM: '/ride/ride-arrival-confirm',
        DELAY_ALERT: '/ride/ride-delay-alert',
    },

    // 测试
    MAP_TEST: '/map-test-page',
} as const;

// 定义路由类型，方便在组件中使用
export type AppRoute = typeof ROUTES;
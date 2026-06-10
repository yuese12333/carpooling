/**
 * @file 路由常量定义
 * @description 对应项目根目录下的 app/ (或 src/pages/) 结构
 *
 * 注：值类型断言为 `any`，避免 expo-router 类型化路由把 `/profile/...`、
 * `/ride/...` 等"位于扫描根之外"的路径判为非法。运行时 expo-router 接受任意字符串。
 */
export const ROUTES = {
    // 根层级
    INDEX: '/' as any,
    HOME: '/home/home' as any,
    FIND_RIDE: '/find-ride/find-ride' as any,
    OFFER_RIDE: '/offer-ride/offer-ride' as any,
    TRIPS: '/trips/trips' as any,
    PROFILE_MAIN: '/profile/profile/profile' as any,

    // 认证模块
    AUTH: {
        LOGIN: '/auth/login/login' as any,
        REGISTER: '/auth/register/register' as any,
        FORGET_PASSWORD: '/auth/forget-password/forget-password' as any,
    },

    // 管理员模块（仅用于前端路由跳转/守卫）
    ADMIN: {
        LOGIN: '/admin/login' as any,
        USERS: '/admin/users' as any,
    },

    // 个人中心模块
    PROFILE: {
        FAVORITE_LOCATIONS: '/profile/favorite-locations/favorite-locations' as any,
        ADD_LOCATION: '/profile/add-location/add-location' as any,
        EDIT_LOCATION: '/profile/edit-location/edit-location' as any,
        MY_VEHICLES: '/profile/my-vehicles/my-vehicles' as any,
        VEHICLE_VERIFICATION: '/profile/vehicle-verification-detail/vehicle-verification-detail' as any,
        EDIT_VEHICLE_INFORMATION: '/profile/edit-vehicle-information/edit-vehicle-information' as any,
        PAYMENT_METHODS: '/profile/payment-methods/payment-methods' as any,
        PAYMENT_HISTORY: '/profile/payment-history/payment-history' as any,
        RECEIPT_DETAIL: '/profile/receipt-detail/receipt-detail' as any,
        NOTIFICATION: '/profile/notification/notification' as any,
        INVITE_FRIENDS: '/profile/invite-friends/invite-friends' as any,
        REAL_NAME_AUTH: '/profile/real-name-auth/real-name-auth' as any,
        HELP_CENTER: '/profile/help-center/help-center' as any,
    },

    // 行程/详情相关
    RIDE: {
        DETAIL: '/ride/ride-detail' as any,
        NAVIGATION: '/ride/ride-navigation' as any,
        ARRIVAL_CONFIRM: '/ride/ride-arrival-confirm' as any,
        DELAY_ALERT: '/ride/ride-delay-alert' as any,
    },

    // 测试
    MAP_TEST: '/map-test-page' as any,
} as const;

// 定义路由类型，方便在组件中使用
export type AppRoute = typeof ROUTES;
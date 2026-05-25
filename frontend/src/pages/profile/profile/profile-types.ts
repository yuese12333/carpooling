/**
 * @file profile-types.ts
 * @description 个人中心页面 UI 状态类型（与 API 层 BadgeItem 区分）
 */

/** 个人中心基础信息状态（展示层，手机号已脱敏） */
export interface IProfileState {
    name: string;
    phone: string;
    avatar: string;
    memberSince: string;
    verified: boolean;
    trips: number;
    rating: number;
}

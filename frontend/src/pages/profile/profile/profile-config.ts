/**
 * @file profile-config.ts
 * @description 个人中心页面的静态配置，集中管理菜单数据与初始勋章状态。
 */

import {
    Car,
    Map,
    CreditCard,
    Shield,
    Users,
    Bell,
    HelpCircle,
    LogOut,
    Phone,
    Globe,
    LucideIcon
} from "lucide-react-native";
import { Href } from 'expo-router';
import { COLORS } from "@/pages/style";
import { ROUTES } from '@/router/paths';
import { BadgeItem } from "@/api/profile-api";

/** * 菜单项接口定义 
 */
export interface IMenuItem {
    icon: LucideIcon;
    label: string;
    sub: string;
    color: string;
    bgColor: string;
    path?: Href;
    done?: boolean;
    danger?: boolean;
}

/** * 菜单分组接口定义 
 */
export interface IMenuGroup {
    group: string;
    items: IMenuItem[];
}

/** 动态菜单副文案上下文 */
export interface ProfileMenuContext {
    verified: boolean;
    carSub?: string;
    paymentSub?: string;
}

/** * 静态菜单数据：定义个人中心功能入口 
 */
export const getMenuData = ({
    verified,
    carSub = '管理我的车辆',
    paymentSub = '管理支付方式',
}: ProfileMenuContext): IMenuGroup[] => [
    {
        group: "出行",
        items: [
            { icon: Car, label: "我的车辆", sub: carSub, color: COLORS.info, bgColor: COLORS.bgBlueLight, path: ROUTES.PROFILE.MY_VEHICLES as Href },
            { icon: Map, label: "常用地点", sub: "管理常用出发地/目的地", color: COLORS.primaryDark, bgColor: COLORS.bgLight, path: ROUTES.PROFILE.FAVORITE_LOCATIONS as Href },
            { icon: CreditCard, label: "支付方式", sub: paymentSub, color: COLORS.accent, bgColor: COLORS.bgPurpleLight, path: ROUTES.PROFILE.PAYMENT_METHODS as Href },
        ],
    },
    {
        group: "账户",
        items: [
            { icon: Shield, label: "实名认证", sub: verified ? "已认证" : "未认证，请前往认证", color: COLORS.primaryDark, bgColor: COLORS.bgLight, done: verified, path: ROUTES.PROFILE.REAL_NAME_AUTH as Href },
            { icon: Phone, label: "紧急联系人", sub: "管理紧急联系人", color: COLORS.danger, bgColor: COLORS.errorLight, path: ROUTES.PROFILE.EMERGENCY_CONTACT as Href },
            { icon: Users, label: "邀请好友", sub: "邀请得奖励", color: COLORS.secondary, bgColor: COLORS.bgOrangeLight, path: ROUTES.PROFILE.INVITE_FRIENDS as Href },
            { icon: Bell, label: "消息通知", sub: "管理通知设置", color: COLORS.info, bgColor: COLORS.bgBlueLight, path: ROUTES.PROFILE.NOTIFICATION as Href },
        ],
    },
    {
        group: "其他",
        items: [
            { icon: Globe, label: "语言设置", sub: "切换中英文", color: COLORS.info, bgColor: COLORS.bgBlueLight, path: ROUTES.PROFILE.LANGUAGE_SETTINGS as Href },
            { icon: HelpCircle, label: "帮助中心", sub: "常见问题解答", color: COLORS.textSecondary, bgColor: COLORS.borderLight, path: ROUTES.PROFILE.HELP_CENTER as Href },
            { icon: LogOut, label: "退出登录", sub: "", color: COLORS.danger, bgColor: COLORS.errorLight, danger: true },
        ],
    },
];

/** * 默认勋章数据：作为 API 加载前的占位或 Mock 数据 
 */
export const badgeData: BadgeItem[] = [
    { emoji: "🌟", label: "100次出行", unlocked: false },
    { emoji: "✅", label: "实名认证", unlocked: true },
    { emoji: "⭐", label: "好评如潮", unlocked: true },
    { emoji: "🚗", label: "老司机", unlocked: false },
    { emoji: "🤝", label: "诚信用户", unlocked: true },
    { emoji: "🔥", label: "连续7天", unlocked: false },
];
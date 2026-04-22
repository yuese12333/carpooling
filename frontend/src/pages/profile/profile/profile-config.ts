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
    LucideIcon
} from "lucide-react-native";
import { Href } from 'expo-router';
import { colors } from "./profile.style";
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

/** * 静态菜单数据：定义个人中心功能入口 
 */
export const menuData: IMenuGroup[] = [
    {
        group: "出行",
        items: [
            { icon: Car, label: "我的车辆", sub: "大众帕萨特 白色", color: colors.bluePrimary, bgColor: colors.blueLight, path: ROUTES.PROFILE.MY_VEHICLES as Href },
            { icon: Map, label: "常用地点", sub: "管理常用出发地/目的地", color: colors.success, bgColor: colors.bgLight, path: ROUTES.PROFILE.FAVORITE_LOCATIONS as Href },
            { icon: CreditCard, label: "支付方式", sub: "微信支付 已绑定", color: colors.purplePrimary, bgColor: colors.purpleLight, path: ROUTES.PROFILE.PAYMENT_METHODS as Href },
        ],
    },
    {
        group: "账户",
        items: [
            { icon: Shield, label: "实名认证", sub: "已认证", color: colors.success, bgColor: colors.bgLight, done: true },
            { icon: Users, label: "邀请好友", sub: "邀请得奖励", color: colors.orangePrimary, bgColor: colors.orangeLight },
            { icon: Bell, label: "消息通知", sub: "管理通知设置", color: colors.bluePrimary, bgColor: colors.blueLight },
        ],
    },
    {
        group: "其他",
        items: [
            { icon: HelpCircle, label: "帮助中心", sub: "常见问题解答", color: colors.textSecondary, bgColor: colors.borderLight },
            { icon: LogOut, label: "退出登录", sub: "", color: colors.danger, bgColor: colors.redLight, danger: true },
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
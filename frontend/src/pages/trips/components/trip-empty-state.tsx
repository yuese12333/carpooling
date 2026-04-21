/**
 * @file trip-empty-state.tsx
 * @description 行程列表为空时的占位组件。
 */

import React from "react";
import { View, Text } from "react-native";
import { Car } from "lucide-react-native";
import { Button } from "@/components/button";
import styles, { COLORS } from "../trips.style";

interface TripEmptyStateProps {
    /** * 点击“去找拼车”按钮的回调函数 
     * 职责声明：该组件不记录交互日志，由父层（Page/Business 层）承接日志记录职责。
     */
    onFindRide: () => void;
    /** * 空状态下的描述性文字
     * 规范：严禁传入 null，缺省或无数据统一使用 undefined。
     */
    description?: string;
    /**
     * 引导按钮文字
     */
    buttonText?: string;
}

/**
 * @description 列表缺省态组件
 * 属于原子 UI 层：严禁感知 requestId，严禁记录业务相关日志。
 */
export const TripEmptyState: React.FC<TripEmptyStateProps> = ({
    onFindRide,
    description = "暂无行程记录",
    buttonText = "去找拼车"
}) => {
    // 审计确保：所有逻辑变量不包含 null，确保数据链路纯净
    const displayDescription = description ?? undefined;
    const displayButtonText = buttonText ?? undefined;

    return (
        <View style={styles.emptyContainer}>
            {/* 图标装饰区：采用统一品牌灰阶 */}
            <View style={styles.emptyIconBox}>
                <Car size={32} color={COLORS.gray300} />
            </View>

            {/* 文案区：语义化文本展示 */}
            <View style={{ marginBottom: 24 }}>
                <Text
                    style={{
                        textAlign: 'center',
                        color: COLORS.gray400,
                        fontSize: 14,
                        lineHeight: 20
                    }}
                >
                    {displayDescription || "暂无行程记录"}
                </Text>
            </View>

            {/* 引导动作区：引用工程化基础组件 */}
            <Button
                onPress={onFindRide}
                style={{
                    backgroundColor: COLORS.primary,
                    paddingHorizontal: 32,
                    borderRadius: 12,
                    elevation: 0, // 移除安卓阴影干扰
                    shadowOpacity: 0 // 移除 iOS 阴影干扰
                }}
            >
                <Text
                    style={{
                        color: COLORS.white,
                        fontWeight: '700',
                        fontSize: 15
                    }}
                >
                    {displayButtonText}
                </Text>
            </Button>
        </View>
    );
};

export default TripEmptyState;

// 导出类型供父级 Page 层进行 Props 校验
export type { TripEmptyStateProps };
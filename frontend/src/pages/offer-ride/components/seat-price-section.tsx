/**
 * @file seat-price-section.tsx
 * @description 拼车发布模块的座位数与定价配置组件，集成标准化日志追踪与交互限流逻辑。
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Users, DollarSign } from 'lucide-react-native';
import { Card } from "@/components/card";
import styles, { COLORS } from "../offer-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 座位与价格区块组件属性定义
 */
interface SeatPriceSectionProps {
    /** 当前选中的座位数 */
    seats: number;
    /** 当前输入的单价字符串 */
    price: string;
    /** 座位变更回调 */
    onUpdateSeats: (seats: number) => void;
    /** 价格变更回调 */
    onUpdatePrice: (val: string) => void;
}

const MODULE_NAME = 'SEAT_PRICE_SECTION';
const MIN_SEATS = 1;
const MAX_SEATS = 4;

/**
 * 拼车发布页 - 座位与费用配置区块
 */
export const SeatPriceSection: React.FC<SeatPriceSectionProps> = ({
    seats,
    price,
    onUpdateSeats,
    onUpdatePrice
}) => {
    // 全局取值：通过 store 获取已存在的 requestId，严禁在此 generate
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 处理座位数调节
     * @param {number} delta 变化量
     */
    const handleSeatAdjustment = (delta: number) => {
        const nextSeats = seats + delta;
        if (nextSeats < MIN_SEATS || nextSeats > MAX_SEATS) return;

        logger.info({
            module: MODULE_NAME,
            operate: 'ADJUST_SEATS',
            requestId,
            params: {
                before: seats,
                after: nextSeats,
                delta
            },
            result: 'SUCCESS'
        });
        onUpdateSeats(nextSeats);
    };

    /**
     * 处理价格输入变更
     * @param {string} text 输入的文本
     */
    const handlePriceChange = (text: string) => {
        try {
            // 基础校验：仅允许数字输入
            const sanitizedText = text.replace(/[^0-9]/g, '');

            // 仅在关键节点或失焦时记录详情，输入过程中记录状态
            logger.info({
                module: MODULE_NAME,
                operate: 'CHANGE_PRICE_INPUT',
                requestId,
                params: { priceLength: sanitizedText.length }, // 隐私保护：不直接记录具体金额明细
                result: 'SUCCESS'
            });

            onUpdatePrice(sanitizedText);
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'CHANGE_PRICE_ERROR',
                requestId,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'INPUT_PROCESSING_FAILED'
            });
        }
    };

    return (
        <Card className="p-4 mb-4">
            <Text style={styles.sectionTitle}>座位与费用</Text>

            <View style={styles.dateTimeRow}>
                {/* 座位计数器区域 */}
                <View style={styles.flexOne}>
                    <Text style={styles.fieldLabel}>可拼座位数</Text>
                    <View style={styles.counterContainer}>
                        <TouchableOpacity
                            onPress={() => handleSeatAdjustment(-1)}
                            style={styles.counterBtn}
                            activeOpacity={0.7}
                            disabled={seats <= MIN_SEATS}
                        >
                            <Text style={[styles.counterBtnText, seats <= MIN_SEATS && styles.disabledText]}>－</Text>
                        </TouchableOpacity>

                        <View style={styles.counterDisplay}>
                            <Users size={14} color={COLORS.textTertiary} style={styles.counterIcon} />
                            <Text style={styles.counterValue}>{seats}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleSeatAdjustment(1)}
                            style={[styles.counterBtn, styles.counterBtnPlus]}
                            activeOpacity={0.7}
                            disabled={seats >= MAX_SEATS}
                        >
                            <Text style={styles.counterBtnTextPlus}>＋</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 费用输入区域 */}
                <View style={styles.flexOne}>
                    <Text style={styles.fieldLabel}>每人收费（元）</Text>
                    <View style={styles.priceInputWrapper}>
                        <DollarSign size={16} color={COLORS.primary} />
                        <TextInput
                            keyboardType="numeric"
                            value={price}
                            onChangeText={handlePriceChange}
                            style={styles.priceInput}
                            placeholder="0"
                            placeholderTextColor={COLORS.textTertiary}
                        />
                        <Text style={styles.priceUnit}>元/人</Text>
                    </View>
                </View>
            </View>

            {/* 业务提示区 */}
            <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 建议定价 ¥15-30 / 人</Text>
            </View>
        </Card>
    );
};
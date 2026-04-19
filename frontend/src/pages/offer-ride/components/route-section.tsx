/**
 * @file route-section.tsx
 * @description 拼车发布模块的路线规划区块，支持起点、终点及动态途经点维护，集成标准化链路追踪。
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Navigation, MapPin, Plus, X } from 'lucide-react-native';
import { Card } from "@/components/card";
import { Input } from "@/components/input";
import styles, { COLORS } from "../offer-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 路线区块组件属性定义
 */
interface RouteSectionProps {
    /** 出发地文本 */
    departure: string;
    /** 目的地文本 */
    destination: string;
    /** 途经地列表 */
    waypointStops: string[];
    /** 当前正在输入的途经地 */
    newStopInput: string;
    /** 更新出发地的回调 */
    onUpdateDeparture: (val: string) => void;
    /** 更新目的地的回调 */
    onUpdateDestination: (val: string) => void;
    /** 更新新途经地输入框的回调 */
    onUpdateNewStop: (val: string) => void;
    /** 执行添加途经地的动作 */
    onAddStop: () => void;
    /** 执行删除指定途经地的动作 */
    onRemoveStop: (index: number) => void;
}

const MODULE_NAME = 'ROUTE_SECTION';

/**
 * 拼车发布页 - 行程路线编辑区块
 */
export const RouteSection: React.FC<RouteSectionProps> = ({
    departure,
    destination,
    waypointStops,
    newStopInput,
    onUpdateDeparture,
    onUpdateDestination,
    onUpdateNewStop,
    onAddStop,
    onRemoveStop
}) => {
    // 全局统一消费 requestId，严禁重复生成
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 处理添加途经点交互
     */
    const handleAddStop = () => {
        const operate = 'ADD_WAYPOINT_STOP';
        try {
            if (!newStopInput.trim()) return;

            logger.info({
                module: MODULE_NAME,
                operate,
                requestId,
                params: { stopLabel: '***' }, // 隐私保护：脱敏地址信息
                result: 'SUCCESS'
            });
            onAddStop();
        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate,
                requestId,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'INTERACTION_ERROR'
            });
        }
    };

    /**
     * 处理移除途经点交互
     * @param {number} index 待移除的目标索引
     */
    const handleRemoveStop = (index: number) => {
        const operate = 'REMOVE_WAYPOINT_STOP';
        if (index < 0 || index >= waypointStops.length) return;

        logger.info({
            module: MODULE_NAME,
            operate,
            requestId,
            params: { targetIndex: index },
            result: 'SUCCESS'
        });
        onRemoveStop(index);
    };

    return (
        <Card className="p-4 mb-4">
            <Text style={styles.sectionTitle}>行程路线</Text>
            <View style={styles.routeRow}>
                {/* 路线装饰线：根据动态途经点生成对应长度的装饰轴 */}
                <View style={styles.timelineContainer}>
                    <View style={styles.dotGreen} />
                    <View style={styles.lineSmall} />
                    {waypointStops.map((_, i) => (
                        <View key={`timeline-stop-${i}`} style={styles.stopTimeline}>
                            <View style={styles.dotGray} />
                            <View style={styles.lineSmall} />
                        </View>
                    ))}
                    <View style={styles.stopTimeline}>
                        <View style={styles.dotGrayLight} />
                        <View style={styles.lineSmall} />
                    </View>
                    <View style={styles.dotOrange} />
                </View>

                {/* 输入容器 */}
                <View style={styles.inputContainer}>
                    {/* 出发地输入 */}
                    <View style={styles.inputWrapper}>
                        <Navigation size={16} color={COLORS.primary} style={styles.inputIcon} />
                        <Input
                            placeholder="出发地点（必填）"
                            value={departure}
                            onChangeText={onUpdateDeparture}
                            style={styles.rnInput}
                        />
                    </View>

                    {/* 已添加途经点列表 */}
                    {waypointStops.map((stop, i) => (
                        <View key={`stop-item-${i}`} style={styles.stopItem}>
                            <View style={styles.stopDot} />
                            <Text style={styles.stopText} numberOfLines={1}>{stop}</Text>
                            <TouchableOpacity
                                onPress={() => handleRemoveStop(i)}
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <X size={16} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* 添加途经点交互行 */}
                    <View style={styles.addStopRow}>
                        <View style={styles.addStopInputWrapper}>
                            <Plus size={16} color={COLORS.textTertiary} style={styles.inputIcon} />
                            <Input
                                placeholder="添加途经地"
                                value={newStopInput}
                                onChangeText={onUpdateNewStop}
                                onSubmitEditing={handleAddStop}
                                style={styles.rnInput}
                            />
                        </View>
                        {newStopInput.trim().length > 0 && (
                            <TouchableOpacity
                                onPress={handleAddStop}
                                style={styles.addButton}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.addButtonText}>添加</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 目的地输入 */}
                    <View style={styles.inputWrapper}>
                        <MapPin size={16} color={COLORS.warning} style={styles.inputIcon} />
                        <Input
                            placeholder="目的地（必填）"
                            value={destination}
                            onChangeText={onUpdateDestination}
                            style={styles.rnInput}
                        />
                    </View>
                </View>
            </View>
        </Card>
    );
};
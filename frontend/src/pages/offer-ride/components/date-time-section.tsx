/**
 * @file date-time-section.tsx
 * @description 拼车发布模块的日期与时间选择组件。
 * 集成标准化日志链路追踪（Logging Tracing）、自动交互流控及多端交互兼容性处理。
 */

import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Clock, ChevronDown, Calendar as CalendarIcon } from 'lucide-react-native';
import { Card } from "@/components/card";
import { Switch } from "@/components/switch";
import { Calendar } from 'react-native-calendars';
import { format } from "date-fns";
import styles, { COLORS } from "../offer-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * @interface DateTimeSectionProps
 * @description 组件属性定义
 */
interface DateTimeSectionProps {
    /** 当前选中的日期对象 */
    selectedDate: Date;
    /** 当前选中的时间字符串 (格式: HH:mm) */
    selectedTime: string;
    /** 控制日历显隐状态 */
    isCalendarVisible: boolean;
    /** 是否开启工作日重复 */
    isRecurring: boolean;
    /** 格式化后的日期显示文本 */
    dateLabel: string;
    /** 切换日历显示的回调 */
    onToggleCalendar: () => void;
    /** 唤起时间选择器的回调 */
    onShowTimePicker: () => void;
    /** 日期选中后的处理函数 */
    onDateSelect: (date: Date) => void;
    /** 重复开关切换的回调 */
    onRecurringChange: (val: boolean) => void;
}

const MODULE_NAME = 'DATE_TIME_SECTION';

/**
 * @component DateTimeSection
 * @description 拼车发布页 - 时间日期选择区块
 */
export const DateTimeSection: React.FC<DateTimeSectionProps> = ({
    selectedDate,
    selectedTime,
    isCalendarVisible,
    isRecurring,
    dateLabel,
    onToggleCalendar,
    onShowTimePicker,
    onDateSelect,
    onRecurringChange
}) => {
    /**
     * 获取全局统一的链路请求 ID
     */
    const getRequestId = () => useEnvStore.getState().currentRequestId;

    /**
     * 内部方法：处理日历显隐切换
     * 修正：将 result 序列化为 string 以匹配 logger 类型定义
     */
    const handleToggleCalendar = (): void => {
        const requestId = getRequestId();
        const nextStatus = !isCalendarVisible;

        logger.info({
            module: MODULE_NAME,
            operate: 'TOGGLE_CALENDAR',
            requestId,
            params: { currentStatus: isCalendarVisible },
            result: String(nextStatus) // 强制转换为 string 
        });

        onToggleCalendar();
    };

    /**
     * 内部方法：处理重复性开关切换
     * 修正：将 result 序列化为 string
     */
    const handleRecurringChange = (val: boolean): void => {
        const requestId = getRequestId();

        logger.info({
            module: MODULE_NAME,
            operate: 'CHANGE_RECURRING_MODE',
            requestId,
            params: { previousValue: isRecurring },
            result: String(val) // 强制转换为 string
        });

        onRecurringChange(val);
    };

    /**
     * 内部方法：处理时间选择器手动唤起日志
     */
    const handleManualTimePickerShow = (): void => {
        logger.info({
            module: MODULE_NAME,
            operate: 'MANUAL_SHOW_TIME_PICKER',
            requestId: getRequestId(),
            params: { currentTime: selectedTime }
        });
        onShowTimePicker();
    };

    /**
     * 核心逻辑：处理日期选中并自动驱动交互流
     */
    const handleDateSelect = (day: { dateString: string }): void => {
        const requestId = getRequestId();
        try {
            logger.info({
                module: MODULE_NAME,
                operate: 'SELECT_DATE_INTERACTION',
                requestId,
                params: { selectedString: day.dateString }
            });

            const parsedDate = new Date(day.dateString.replace(/-/g, '/'));

            if (isNaN(parsedDate.getTime())) {
                throw new Error(`Invalid Date parsed from: ${day.dateString}`);
            }

            onDateSelect(parsedDate);
            onToggleCalendar();

            // 针对不同平台的交互延迟处理
            const INTERACTION_DELAY = Platform.OS === 'android' ? 600 : 400;

            setTimeout(() => {
                logger.info({
                    module: MODULE_NAME,
                    operate: 'AUTO_TRIGGER_TIME_PICKER',
                    requestId,
                    params: { delay: INTERACTION_DELAY }
                });
                onShowTimePicker();
            }, INTERACTION_DELAY);

        } catch (error) {
            logger.error({
                module: MODULE_NAME,
                operate: 'SELECT_DATE_ERROR',
                requestId,
                error: error instanceof Error ? error.message : String(error),
                errorType: 'UI_LOGIC_ERROR',
                params: { input: day.dateString }
            });
        }
    };

    const safeSelectedDate = selectedDate instanceof Date ? selectedDate : new Date();
    const calendarCurrentDate = format(safeSelectedDate, 'yyyy-MM-dd');

    return (
        <Card className="p-4 mb-4">
            <Text style={styles.sectionTitle}>出发时间</Text>

            <View style={styles.dateTimeRow}>
                <View style={styles.flexOne}>
                    <Text style={styles.fieldLabel}>日期</Text>
                    <TouchableOpacity
                        onPress={handleToggleCalendar}
                        style={styles.timeSelector}
                        activeOpacity={0.7}
                    >
                        <CalendarIcon size={16} color={COLORS.primary} style={styles.timeIcon} />
                        <Text style={styles.timeText}>{dateLabel || '请选择日期'}</Text>
                        <ChevronDown size={16} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.flexOne}>
                    <Text style={styles.fieldLabel}>时间</Text>
                    <TouchableOpacity
                        onPress={handleManualTimePickerShow}
                        style={styles.timeSelector}
                        activeOpacity={0.7}
                    >
                        <Clock size={16} color={COLORS.secondary} style={styles.timeIcon} />
                        <Text style={styles.timeText}>{selectedTime}</Text>
                        <ChevronDown size={16} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            {isCalendarVisible && (
                <View style={styles.calendarContainer}>
                    <Calendar
                        current={calendarCurrentDate}
                        markedDates={{
                            [calendarCurrentDate]: {
                                selected: true,
                                selectedColor: COLORS.primary
                            }
                        }}
                        onDayPress={handleDateSelect}
                        theme={{
                            todayTextColor: COLORS.primary,
                            selectedDayBackgroundColor: COLORS.primary,
                            arrowColor: COLORS.primary,
                            textDayFontSize: 14,
                            textMonthFontSize: 16
                        }}
                    />
                </View>
            )}

            <View style={styles.recurringSection}>
                <View style={styles.recurringInfo}>
                    <Text style={styles.recurringTitle}>工作日重复</Text>
                    <Text style={styles.recurringSub}>每周一到周五重复此行程</Text>
                </View>
                <Switch
                    checked={isRecurring}
                    onCheckedChange={handleRecurringChange}
                />
            </View>
        </Card>
    );
};
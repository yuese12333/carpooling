/**
 * @file use-offer-ride-form.ts
 * @description 拼车发布表单业务逻辑 Hook，集成标准化日志链路追踪与权限校验
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { format, isSameDay, addDays } from "date-fns";
import * as RideApi from '@/api/offer-ride-api';
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 标签对象定义
 */
interface PresetTag {
    label: string;
    value: string;
}

const MODULE_NAME = 'USE_OFFER_RIDE_FORM';

export const useOfferRideForm = () => {
    const router = useRouter();

    // --- 状态管理 ---
    const [departureLocation, setDepartureLocation] = useState<string>("");
    const [destinationLocation, setDestinationLocation] = useState<string>("");
    const [availableSeats, setAvailableSeats] = useState<number>(2);
    const [pricePerPerson, setPricePerPerson] = useState<string>("20");
    const [additionalNotes, setAdditionalNotes] = useState<string>("");
    const [waypointStops, setWaypointStops] = useState<string[]>([]);
    const [newStopInput, setNewStopInput] = useState<string>("");
    const [isPublishingSuccess, setIsPublishingSuccess] = useState<boolean>(false);
    const [isRecurringMode, setIsRecurringMode] = useState<boolean>(false);
    const [presetTags, setPresetTags] = useState<PresetTag[]>([]);
    const [selectedDateObj, setSelectedDateObj] = useState<Date>(new Date());
    const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("08:30");
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

    // --- 工具函数 ---
    /**
     * 从 Store 获取当前请求 ID
     */
    const getRequestId = () => useEnvStore.getState().currentRequestId;

    // --- 副作用 ---
    useEffect(() => {
        /**
         * 页面初始化：校验权限并加载配置
         */
        const initPage = async () => {
            const requestId = getRequestId();
            const operate = 'INIT_PUBLISH_PAGE';

            try {
                // 权限校验
                const permRes = await RideApi.checkPublishPermission();
                if (!permRes.data.canPublish) {
                    logger.warn({
                        module: MODULE_NAME,
                        operate,
                        requestId,
                        result: 'PERMISSION_DENIED',
                        error: '信用分不足或配额耗尽'
                    });
                    Alert.alert("权限受限", "您的信用分较低或今日配额已用完");
                    return;
                }

                // 配置加载
                const configRes = await RideApi.getPublishConfig();
                if (configRes.code === 200) {
                    setPresetTags(configRes.data.presetTags);
                    logger.info({
                        module: MODULE_NAME,
                        operate,
                        requestId,
                        result: 'SUCCESS'
                    });
                }
            } catch (error) {
                logger.error({
                    module: MODULE_NAME,
                    operate,
                    requestId,
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'INITIALIZATION_FAILED'
                });
                Alert.alert("加载失败", "初始化基础配置时出错");
            }
        };
        initPage();
    }, []);

    // --- 事件处理函数 ---
    const showTimePicker = () => setTimePickerVisibility(true);
    const hideTimePicker = () => setTimePickerVisibility(false);

    /**
     * 确认选择时间
     * @param {Date} date 选择的日期对象
     */
    const handleTimeConfirm = (date: Date) => {
        setSelectedTime(format(date, "HH:mm"));
        hideTimePicker();
    };

    /**
     * 生成日期显示文本
     * @param {Date} date 目标日期
     * @returns {string} 格式化后的标签（如：今天、明天）
     */
    const getDateLabel = (date: Date) => {
        const today = new Date();
        if (isSameDay(date, today)) return "今天";
        if (isSameDay(date, addDays(today, 1))) return "明天";
        if (isSameDay(date, addDays(today, 2))) return "后天";
        return format(date, "MM月dd日");
    };

    /**
     * 执行发布行程业务
     * @returns {Promise<void>}
     */
    const handlePublishRide = async (): Promise<void> => {
        const requestId = getRequestId();
        const operate = 'SUBMIT_PUBLISH_RIDE';

        if (!departureLocation.trim() || !destinationLocation.trim()) {
            Alert.alert("提示", "请完整填写出发地和目的地");
            return;
        }

        const params: RideApi.PublishRideParams = {
            from: departureLocation,
            to: destinationLocation,
            stops: waypointStops,
            date: format(selectedDateObj, "yyyy-MM-dd"),
            time: selectedTime,
            seats: availableSeats,
            price: Number(pricePerPerson),
            notes: additionalNotes,
            isRecurring: isRecurringMode,
            recurringRules: isRecurringMode ? { daysOfWeek: [1, 2, 3, 4, 5], endDate: "2026-05-19" } : undefined
        };

        try {
            logger.info({
                module: MODULE_NAME,
                operate,
                requestId,
                params: { ...params, notes: '***' } // 脱敏处理
            });

            const result = await RideApi.publishRide(params);

            if (result.code === 200) {
                setIsPublishingSuccess(true);
                logger.info({
                    module: MODULE_NAME,
                    operate,
                    requestId,
                    result: 'PUBLISH_SUCCESS'
                });

                setTimeout(() => {
                    router.replace(ROUTES.TRIPS);
                }, 1500);
            } else {
                throw new Error(result.message || "服务器响应异常");
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "未知错误";

            logger.error({
                module: MODULE_NAME,
                operate,
                requestId,
                params: { from: departureLocation, to: destinationLocation },
                error: errorMsg,
                errorType: 'SUBMISSION_FAILED'
            });

            Alert.alert("发布失败", errorMsg);
            setIsPublishingSuccess(false);
        }
    };

    /**
     * 添加途径点
     */
    const handleAddStop = (): void => {
        const trimmedStop = newStopInput.trim();
        if (trimmedStop) {
            setWaypointStops((prev) => [...prev, trimmedStop]);
            setNewStopInput("");
        }
    };

    /**
     * 移除途径点
     * @param {number} index 途径点索引
     */
    const handleRemoveStop = (index: number): void => {
        setWaypointStops((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * 快捷追加备注标签
     * @param {string} tag 预设标签文本
     */
    const appendNoteTag = (tag: string): void => {
        setAdditionalNotes((prev) => (prev ? `${prev}，${tag}` : tag));
    };

    /**
     * 处理日期变化
     * @param date 
     */
    const handleDateChange = (date: Date) => {
        setSelectedDateObj(date);
    };

    // --- 返回状态与操作 ---
    return {
        state: {
            departureLocation,
            destinationLocation,
            availableSeats,
            pricePerPerson,
            additionalNotes,
            waypointStops,
            newStopInput,
            isPublishingSuccess,
            isRecurringMode,
            presetTags,
            selectedDateObj,
            isCalendarVisible,
            selectedTime,
            isTimePickerVisible,
        },
        actions: {
            setDepartureLocation,
            setDestinationLocation,
            setAvailableSeats,
            setPricePerPerson,
            setAdditionalNotes,
            setNewStopInput,
            setIsRecurringMode,
            setIsCalendarVisible,
            setSelectedDateObj: handleDateChange,
            showTimePicker,
            hideTimePicker,
            handleTimeConfirm,
            getDateLabel,
            handlePublishRide,
            handleAddStop,
            handleRemoveStop,
            appendNoteTag,
        }
    };
};
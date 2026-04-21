/**
 * @file use-offer-ride-form.ts
 * @description 拼车发布表单业务逻辑 Hook。
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from 'expo-router';
import { format, isSameDay, addDays } from "date-fns";
import * as RideApi from '@/api/offer-ride-api';
import { ROUTES } from '@/router/paths';
import logger from '@/utils/logger';

/**
 * 标签对象定义
 */
interface PresetTag {
    label: string;
    value: string;
}

const MODULE_NAME = 'USE_OFFER_RIDE_FORM';

/**
 * @hook useOfferRideForm
 * @param {string} requestId - [显式注入] 业务流唯一链路 ID
 */
export const useOfferRideForm = (requestId: string) => {
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

    // --- 副作用 ---
    useEffect(() => {
        /**
         * 页面初始化：校验权限并加载配置
         * 显式使用传入的 requestId
         */
        const initPage = async () => {
            const operate = 'INIT_PUBLISH_PAGE';

            try {
                // 1. 权限校验 (显式透传 requestId)
                const permRes = await RideApi.checkPublishPermission(requestId);
                if (!permRes.data.canPublish) {
                    logger.warn({
                        module: MODULE_NAME,
                        operate,
                        requestId,
                        params: undefined,
                        result: 'PERMISSION_DENIED',
                        error: '信用分不足或配额耗尽',
                        errorType: 'BUSINESS_RESTRICTION'
                    });
                    Alert.alert("权限受限", "您的信用分较低或今日配额已用完");
                    return;
                }

                // 2. 配置加载 (显式透传 requestId)
                const configRes = await RideApi.getPublishConfig(requestId);
                if (configRes.code === 200) {
                    setPresetTags(configRes.data.presetTags);
                    logger.info({
                        module: MODULE_NAME,
                        operate,
                        requestId,
                        params: undefined,
                        result: 'SUCCESS',
                        error: undefined,
                        errorType: undefined
                    });
                }
            } catch (error) {
                logger.error({
                    module: MODULE_NAME,
                    operate,
                    requestId,
                    params: undefined,
                    error: error instanceof Error ? error.message : String(error),
                    errorType: 'INITIALIZATION_FAILED',
                    result: 'FAILED'
                });
                Alert.alert("加载失败", "初始化基础配置时出错");
            }
        };

        if (requestId) {
            initPage();
        }
    }, [requestId]);

    // --- 事件处理函数 ---
    const showTimePicker = () => setTimePickerVisibility(true);
    const hideTimePicker = () => setTimePickerVisibility(false);

    /**
     * 确认选择时间
     */
    const handleTimeConfirm = (date: Date) => {
        setSelectedTime(format(date, "HH:mm"));
        hideTimePicker();
    };

    /**
     * 生成日期显示文本
     */
    const getDateLabel = (date: Date) => {
        const today = new Date();
        if (isSameDay(date, today)) return "今天";
        if (isSameDay(date, addDays(today, 1))) return "明天";
        if (isSameDay(date, addDays(today, 2))) return "后天";
        return format(date, "MM月dd日");
    };

    /**
     * 执行发布行程业务 (显式链路追踪)
     */
    const handlePublishRide = async (): Promise<void> => {
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
                params: { ...params, notes: '***' }, // 隐私脱敏
                result: 'START_SUBMISSION',
                error: undefined,
                errorType: undefined
            });

            // 显式将 requestId 注入 API 层
            const result = await RideApi.publishRide(params, requestId);

            if (result.code === 200) {
                setIsPublishingSuccess(true);
                logger.info({
                    module: MODULE_NAME,
                    operate,
                    requestId,
                    params: { rideId: result.data.rideId },
                    result: 'PUBLISH_SUCCESS',
                    error: undefined,
                    errorType: undefined
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
                params: { from: '***', to: '***' }, // 隐私保护
                error: errorMsg,
                errorType: 'SUBMISSION_FAILED',
                result: 'FAILED'
            });

            Alert.alert("发布失败", errorMsg);
            setIsPublishingSuccess(false);
        }
    };

    /**
     * 添加途径点 (业务逻辑层日志)
     */
    const handleAddStop = (): void => {
        const trimmedStop = newStopInput.trim();
        if (trimmedStop) {
            setWaypointStops((prev) => [...prev, trimmedStop]);
            setNewStopInput("");

            logger.info({
                module: MODULE_NAME,
                operate: 'ADD_WAYPOINT_STOP_LOGIC',
                requestId,
                params: { stopsCount: waypointStops.length + 1 },
                result: 'SUCCESS',
                error: undefined,
                errorType: undefined
            });
        }
    };

    /**
     * 移除途径点
     */
    const handleRemoveStop = (index: number): void => {
        setWaypointStops((prev) => prev.filter((_, i) => i !== index));

        logger.info({
            module: MODULE_NAME,
            operate: 'REMOVE_WAYPOINT_STOP_LOGIC',
            requestId,
            params: { targetIndex: index },
            result: 'SUCCESS',
            error: undefined,
            errorType: undefined
        });
    };

    /**
     * 快捷追加备注标签
     */
    const appendNoteTag = (tag: string): void => {
        setAdditionalNotes((prev) => (prev ? `${prev}，${tag}` : tag));
    };

    /**
     * 处理日期变化
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
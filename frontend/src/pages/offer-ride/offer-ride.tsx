/**
 * @file offer-ride.tsx
 * @description 驾驶员发布拼车行程页面。
 * 聚合路线、日期时间、座位价格及备注模块，集成标准化日志链路追踪与原生 Picker 适配。
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { ArrowLeft, Check } from "lucide-react-native";
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { RouteSection } from "./components/route-section";
import { DateTimeSection } from "./components/date-time-section";
import { SeatPriceSection } from "./components/seat-price-section";
import { NotesSection } from "./components/notes-section";
import { Button } from "../../../components/button";

import styles, { COLORS } from "./offer-ride.style";
import { useOfferRideForm } from "@/hooks/use-offer-ride-form";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

const MODULE_NAME = 'OFFER_RIDE_PAGE';

export default function OfferRidePage() {
  const router = useRouter();
  const { state, actions } = useOfferRideForm();

  /**
   * 动态获取全局唯一 RequestId
   * @returns {string | undefined}
   */
  const getRequestId = () => useEnvStore.getState().currentRequestId;

  /**
   * 页面初始化链路追踪
   */
  useEffect(() => {
    logger.info({
      module: MODULE_NAME,
      operate: 'PAGE_ENTER',
      requestId: getRequestId(),
      params: {
        timestamp: Date.now(),
        platform: Platform.OS
      }
    });
  }, []);

  /**
   * 处理返回交互逻辑
   */
  const handleBack = (): void => {
    const requestId = getRequestId();
    logger.info({
      module: MODULE_NAME,
      operate: 'NAVIGATE_BACK',
      requestId
    });
    router.back();
  };

  /**
   * 处理最终发布行程逻辑
   */
  const handlePublish = async (): Promise<void> => {
    const requestId = getRequestId();
    logger.info({
      module: MODULE_NAME,
      operate: 'TRIGGER_PUBLISH_RIDE',
      requestId,
      params: {
        hasDeparture: !!state.departureLocation,
        hasDestination: !!state.destinationLocation
      }
    });

    try {
      await actions.handlePublishRide();
    } catch (error) {
      logger.error({
        module: MODULE_NAME,
        operate: 'PUBLISH_RIDE_FAILED',
        requestId,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_SUBMISSION_ERROR'
      });
    }
  };

  /**
   * 原生时间选择器变更回调逻辑
   * @param {DateTimePickerEvent} event - 选择器事件对象
   * @param {Date} [selectedDate] - 选中的日期对象
   */
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    const requestId = getRequestId();

    // 1. 处理用户取消/关闭行为
    if (event.type === 'dismissed') {
      logger.info({
        module: MODULE_NAME,
        operate: 'TIME_PICK_CANCEL',
        requestId,
        params: { eventType: event.type }
      });
      actions.hideTimePicker();
      return;
    }

    // 2. 处理确认选择逻辑
    if (selectedDate) {
      logger.info({
        module: MODULE_NAME,
        operate: 'TIME_PICK_CONFIRM',
        requestId,
        params: {
          eventType: event.type,
          selectedTime: selectedDate.toLocaleTimeString()
        }
      });
      actions.handleTimeConfirm(selectedDate);
    }

    // 3. Android 平台特有逻辑：确认后需手动关闭 Picker 状态
    if (Platform.OS === 'android') {
      actions.hideTimePicker();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>发布行程</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. 路线模块 */}
        <RouteSection
          departure={state.departureLocation}
          destination={state.destinationLocation}
          waypointStops={state.waypointStops}
          newStopInput={state.newStopInput}
          onUpdateDeparture={actions.setDepartureLocation}
          onUpdateDestination={actions.setDestinationLocation}
          onUpdateNewStop={actions.setNewStopInput}
          onAddStop={actions.handleAddStop}
          onRemoveStop={actions.handleRemoveStop}
        />

        {/* 2. 时间日期模块 */}
        <DateTimeSection
          selectedDate={state.selectedDateObj}
          selectedTime={state.selectedTime}
          isCalendarVisible={state.isCalendarVisible}
          isRecurring={state.isRecurringMode}
          dateLabel={actions.getDateLabel(state.selectedDateObj)}
          onToggleCalendar={() => actions.setIsCalendarVisible(!state.isCalendarVisible)}
          onShowTimePicker={actions.showTimePicker}
          onDateSelect={(date: Date) => {
            const requestId = getRequestId();
            actions.setSelectedDateObj(date);

            logger.info({
              module: MODULE_NAME,
              operate: 'SET_DATE_STATE',
              requestId,
              params: { targetDate: date.toISOString() }
            });
          }}
          onRecurringChange={actions.setIsRecurringMode}
        />

        {/* 3. 座位价格模块 */}
        <SeatPriceSection
          seats={state.availableSeats}
          price={state.pricePerPerson}
          onUpdateSeats={actions.setAvailableSeats}
          onUpdatePrice={actions.setPricePerPerson}
        />

        {/* 4. 备注标签模块 */}
        <NotesSection
          notes={state.additionalNotes}
          tags={state.presetTags}
          onUpdateNotes={actions.setAdditionalNotes}
          onAddTag={actions.appendNoteTag}
        />

        <View style={styles.scrollSpacer} />
      </ScrollView>

      {/* 5. 原生时间选择器挂载 (Portal 逻辑) */}
      {state.isTimePickerVisible && (
        <DateTimePicker
          value={state.selectedDateObj instanceof Date ? state.selectedDateObj : new Date()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* 底部固定操作区 */}
      <View style={styles.footer}>
        {state.isPublishingSuccess ? (
          <View style={styles.successBtn}>
            <Check size={20} color="white" style={styles.successIcon} />
            <Text style={styles.publishBtnText}>发布成功！</Text>
          </View>
        ) : (
          <Button
            onPress={handlePublish}
            disabled={!state.departureLocation || !state.destinationLocation}
            className={`w-full py-4 rounded-2xl ${(state.departureLocation && state.destinationLocation)
                ? "bg-green-500"
                : "bg-gray-200"
              }`}
          >
            <Text style={[
              styles.publishBtnText,
              !(state.departureLocation && state.destinationLocation) && styles.disabledText
            ]}>
              发布行程
            </Text>
          </Button>
        )}
      </View>
    </SafeAreaView >
  );
}
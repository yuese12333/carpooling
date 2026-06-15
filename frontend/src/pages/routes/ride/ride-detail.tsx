/**
 * @file ride-detail.tsx
 * @description 行程详情页面，展示行程信息、司机信息、预订功能。
 */

import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Users, Clock, MapPin, Car, Star, Phone, MessageCircle } from "lucide-react-native";

import styles from "./ride-detail.style";
import { COLORS } from '@/pages/style';
import { ROUTES } from '@/router/paths';
import logger, { generateRequestId } from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';
import { rideDetailApi, type RideDetailData } from '@/api/ride-detail-api';

/**
 * 行程详情页面组件
 */
export default function RideDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rideId = params.id as string;
  const requestId = useMemo(() => generateRequestId(), []);
  const isMockMode = useEnvStore((state) => state.isMockMode);

  const [loading, setLoading] = useState(true);
  const [rideDetail, setRideDetail] = useState<RideDetailData | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    logger.info({
      module: 'page.rideDetail',
      operate: 'initPage',
      params: { rideId },
      result: 'Ride detail page initialized',
      requestId,
    });

    loadRideDetail();
  }, [rideId, requestId]);

  const loadRideDetail = async () => {
    setLoading(true);
    try {
      const result = await rideDetailApi.getDetail(rideId, requestId);
      if (result.success && result.data) {
        setRideDetail(result.data);
      } else {
        Alert.alert("提示", "加载行程详情失败");
      }
    } catch (error) {
      logger.error({
        module: 'page.rideDetail',
        operate: 'loadRideDetail',
        params: { rideId },
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_ERROR',
        requestId,
      });
      Alert.alert("提示", "加载行程详情失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleBook = async () => {
    if (!rideDetail) return;

    setBooking(true);
    try {
      const result = await rideDetailApi.bookRide({
        rideId: rideDetail.rideId,
        seats: 1,
        remark: '',
        requestId,
      });

      if (result.success) {
        Alert.alert("成功", "预订成功！", [
          { text: "查看订单", onPress: () => router.replace(ROUTES.TRIPS) },
          { text: "返回", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("提示", result.message || "预订失败");
      }
    } catch (error) {
      logger.error({
        module: 'page.rideDetail',
        operate: 'handleBook',
        params: { rideId },
        error: error instanceof Error ? error.message : String(error),
        errorType: 'BOOKING_ERROR',
        requestId,
      });
      Alert.alert("提示", "预订失败，请重试");
    } finally {
      setBooking(false);
    }
  };

  const handleContact = () => {
    Alert.alert("联系司机", "隐私号码功能暂未开放");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!rideDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>行程详情</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>行程不存在或已结束</Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>行程详情</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 路线信息 */}
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>出发</Text>
              <Text style={styles.routeAddress}>{rideDetail.fromText}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>目的地</Text>
              <Text style={styles.routeAddress}>{rideDetail.toText}</Text>
            </View>
          </View>
        </View>

        {/* 出发时间 */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Clock size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>出发时间</Text>
              <Text style={styles.infoValue}>
                {new Date(rideDetail.departAt).toLocaleString('zh-CN')}
              </Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Users size={20} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>剩余座位</Text>
              <Text style={styles.infoValue}>{rideDetail.seatsLeft} / {rideDetail.seatsTotal} 座</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.priceLabel}>¥</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>单价</Text>
              <Text style={styles.priceValue}>¥{rideDetail.price}/座</Text>
            </View>
          </View>
        </View>

        {/* 司机信息 */}
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>司机信息</Text>
          <View style={styles.driverInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {rideDetail.driver.userName?.charAt(0) || '司'}
              </Text>
            </View>
            <View style={styles.driverDetail}>
              <Text style={styles.driverName}>{rideDetail.driver.userName}</Text>
              <View style={styles.ratingRow}>
                <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                <Text style={styles.ratingText}>{rideDetail.driver.rating.toFixed(1)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleContact} style={styles.contactButton}>
              <Phone size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 车辆信息 */}
        {rideDetail.vehicle && (
          <View style={styles.vehicleCard}>
            <Text style={styles.sectionTitle}>车辆信息</Text>
            <View style={styles.vehicleInfo}>
              <Car size={20} color={COLORS.textSub} />
              <Text style={styles.vehicleText}>
                {rideDetail.vehicle.model} · {rideDetail.vehicle.color} · {rideDetail.vehicle.plateNumber}
              </Text>
            </View>
          </View>
        )}

        {/* 备注 */}
        {rideDetail.remark && (
          <View style={styles.remarkCard}>
            <Text style={styles.sectionTitle}>备注</Text>
            <Text style={styles.remarkText}>{rideDetail.remark}</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContact} style={styles.messageButton}>
          <MessageCircle size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleBook}
          style={styles.bookButton}
          disabled={booking || rideDetail.seatsLeft === 0}
        >
          {booking ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.bookButtonText}>
              {rideDetail.seatsLeft > 0 ? '立即预订' : '已满员'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

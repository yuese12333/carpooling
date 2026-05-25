/**
 * @file ride-navigation.tsx
 * @description 导航页面 - 基于高德原生 SDK，提供出发地/目的地输入与地图导航功能
 */

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navigation, MapPin, ArrowLeft } from 'lucide-react-native';

import { AmapMapTestView } from '@/../components/amap-map-test-view';
import { generateRequestId } from '@/utils/logger';
import { useRideNavigationForm } from '@/hooks/use-ride-navigation-form';
import styles from './ride-navigation.style';

export default function RideNavigationPage() {
  const insets = useSafeAreaInsets();
  const requestId = useMemo(() => generateRequestId(), []);

  const {
    latitude,
    longitude,
    recenterToken,
    locLoading,
    naviLoading,
    locError,
    formError,
    statusText,
    fromInput,
    toInput,
    setFromInput,
    setToInput,
    handleLocate,
    handleStartNavigation,
    goBack,
  } = useRideNavigationForm(requestId);

  const canStartNavi = Boolean(fromInput.trim() && toInput.trim()) && !naviLoading;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>行程导航</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputCard}>
            <Text style={styles.inputCardTitle}>设置路线</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputIconGreen}>
                <Navigation size={14} color="#16a34a" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="出发地"
                placeholderTextColor="#9ca3af"
                value={fromInput}
                onChangeText={setFromInput}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputIconOrange}>
                <MapPin size={14} color="#f97316" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="目的地"
                placeholderTextColor="#9ca3af"
                value={toInput}
                onChangeText={setToInput}
              />
            </View>

            <TouchableOpacity
              style={[styles.locBtn, locLoading && styles.btnDisabled]}
              onPress={handleLocate}
              disabled={locLoading}
              activeOpacity={0.8}
            >
              {locLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>📍 获取当前位置</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startBtn, !canStartNavi && styles.btnDisabled]}
              onPress={handleStartNavigation}
              disabled={!canStartNavi}
              activeOpacity={0.8}
            >
              {naviLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>🚗 开始导航</Text>
              )}
            </TouchableOpacity>

            {formError ? (
              <Text style={styles.errorText}>{formError}</Text>
            ) : null}
            {locError ? (
              <Text style={styles.errorText}>{locError}</Text>
            ) : null}
            {!formError && !locError && statusText ? (
              <Text style={styles.successText}>{statusText}</Text>
            ) : null}

            {Platform.OS !== 'android' && (
              <Text style={styles.hintText}>
                ⚠️ 地图与导航功能仅支持 Android 端
              </Text>
            )}
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.mapShell}>
              <AmapMapTestView
                style={styles.mapInner}
                latitude={latitude ?? undefined}
                longitude={longitude ?? undefined}
                zoom={16}
                recenterToken={recenterToken}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

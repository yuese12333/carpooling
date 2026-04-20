/**
 * @file register.tsx
 * @description 用户注册模块主页面 - 负责注册流程调度、步骤控制及全链路追踪 ID 初始化。
 */

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from "lucide-react-native";

import styles, { COLORS } from "./register.style";

// 导入标准化日志工具与状态管理
import logger, { generateRequestId } from "@/utils/logger";
import { useEnvStore } from "@/store/env-store";
import { ROUTES } from '@/router/paths';

// 导入业务逻辑 Hook
import { useRegisterForm } from "@/hooks/use-register-form";

// 导入拆分后的步骤组件及类型定义
import { StepInfoForm } from "./components/step-info-form";
import { StepPasswordForm } from "./components/step-password-form";
import { useAuth } from "@/store/auth-context";

/**
 * @interface StepIndicatorProps
 * @description 步骤进度指示器组件属性
 */
interface StepIndicatorProps {
  active: boolean;
  isCompleted: boolean;
  label: string;
}

/**
 * 步骤进度指示器子组件
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({ active, isCompleted, label }) => (
  <View style={styles.stepItem}>
    <View style={[
      styles.stepCircle,
      isCompleted ? styles.stepCircleCompleted : active ? styles.stepCircleActive : styles.stepCircleInactive
    ]}>
      {isCompleted ? (
        <Check size={16} color={COLORS.primary} strokeWidth={3} />
      ) : (
        <View style={[styles.stepDot, { backgroundColor: active ? 'white' : COLORS.whiteTransparent30 }]} />
      )}
    </View>
    <Text style={[styles.stepLabel, { color: active ? 'white' : COLORS.whiteTransparent50 }]}>
      {label}
    </Text>
  </View>
);

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { isMockMode } = useEnvStore();

  /**
   * 链路追踪初始化
   * 遵循规范：Page 入口层 generateRequestId，仅用于本页面日志，不覆盖全局 Store
   */
  const requestId = useMemo(() => generateRequestId(), []);

  useEffect(() => {
    logger.info({
      module: 'Register',
      operate: 'PAGE_ENTRY',
      params: { isMockMode, platform: Platform.OS },
      requestId: requestId
    });
  }, [requestId, isMockMode]);

  // --- 状态管理 ---
  // 获取强类型的 state 与 actions
  const { state, actions } = useRegisterForm(isMockMode, register, requestId);

  /**
   * 处理导航回退逻辑
   */
  const handleBackPress = () => {
    const currentRequestId = useEnvStore.getState().currentRequestId;

    if (state.currentStep === 2) {
      logger.info({
        module: 'Register',
        operate: 'BACK_TO_STEP_ONE',
        requestId: currentRequestId
      });
      actions.setCurrentStep(1);
    } else {
      logger.info({
        module: 'Register',
        operate: 'EXIT_REGISTER_FLOW',
        requestId: currentRequestId
      });
      router.push(ROUTES.AUTH.LOGIN);
    }
  };

  /**
   * 跳转登录页面日志记录
   */
  const navigateToLogin = () => {
    logger.info({
      module: 'Register',
      operate: 'NAVIGATE_TO_LOGIN_CLICK',
      requestId: useEnvStore.getState().currentRequestId
    });
    router.push(ROUTES.AUTH.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>

            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>创建账号</Text>
              {isMockMode && (
                <View style={styles.mockBadge}>
                  <Text style={styles.mockText}>Mock 模式</Text>
                </View>
              )}
            </View>

            <Text style={styles.headerSubtitle}>
              {state.currentStep === 1
                ? "填写基本信息，快速注册"
                : "设置登录密码，保护账号安全"}
            </Text>

            <View style={styles.stepWrapper}>
              <StepIndicator
                active={state.currentStep >= 1}
                isCompleted={state.currentStep > 1}
                label="基本信息"
              />
              <View style={styles.stepConnector}>
                <View style={[
                  styles.stepConnectorFill,
                  { width: state.currentStep > 1 ? '100%' : '0%' }
                ]} />
              </View>
              <StepIndicator
                active={state.currentStep >= 2}
                isCompleted={false}
                label="设置密码"
              />
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* 修复重点：通过精确传递 state 和 actions 解决泛型不兼容问题。
              确保 StepInfoForm 和 StepPasswordForm 内部定义的 updateForm 类型
              与 useRegisterForm 返回的泛型方法完全一致。
            */}
            {state.currentStep === 1 ? (
              <StepInfoForm requestId={requestId} state={state} actions={actions} />
            ) : (
              <StepPasswordForm requestId={requestId} state={state} actions={actions} />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账号？</Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.footerLink}>去登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}
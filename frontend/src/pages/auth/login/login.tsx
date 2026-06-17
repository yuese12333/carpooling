/**
 * @file login-page.tsx
 * @description 登录页面组件。
 * 负责用户身份验证交互，包含手机号/密码登录、第三方社交登录接入及环境切换功能。
 * 遵循全链路日志追踪规范，作为 RequestId 的生命周期起点。
 */

import React, { useMemo, useState, useCallback, useEffect, useRef, JSX } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  ScrollView,
  TextInput,
  Switch,
  type ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';

// 样式与常量
import styles from './login.style';
import { COLORS } from '@/pages/style';

// 工具类
import logger, { generateRequestId } from '../../../utils/logger';
import { isApiSuccess } from '@/utils/api-response';
import { syncRequestId } from '@/utils/sync-request-id';

// 状态管理与 Hook
import { useLoginForm } from '../../../hooks/use-login-form';
import { useEnvStore } from '../../../store/env-store';

// 路由常量
import { ROUTES } from '../../../router/paths';

// 基础组件
import { Button } from '../../../../components/button';
import { Checkbox } from '../../../../components/checkbox';
import { Separator } from '../../../../components/separator';
import { Label } from '../../../../components/label';
import { Alert } from '../../../../components/alert';
import { SocialChannelItem } from './components/social-channel-item';
import { LanguageSwitch } from '../../../../components/language-switch';

// API 接口定义
import {
  fetchLoginConfig,
  type PageConfig,
  type SocialItemProps
} from '../../../api/auth';

/** 默认国际区号 */
const DEFAULT_PHONE_PREFIX = '+86';

/** 环境切换开关缩放比例 */
const SWITCH_SCALE_STYLE = { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] };

/**
 * 登录页面主组件
 * @returns {JSX.Element} 渲染登录页面布局
 */
export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { isMockMode, toggleMockMode } = useEnvStore();
  const requestId = useMemo(() => generateRequestId(), []);

  useEffect(() => {
    syncRequestId(requestId);
  }, [requestId]);

  // 登录表单核心业务逻辑封装
  const { state, actions } = useLoginForm(isMockMode, requestId);

  // 页面 UI 配置状态
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const lastInitLogKeyRef = useRef<string>('');
  const lastConfigLoadKeyRef = useRef<string>('');

  /**
   * 初始化页面链路追踪
   * 在组件挂载时将生成的 requestId 注入全局状态仓库，供拦截器与 Hook 使用
   */
  useEffect(() => {
    const initLogKey = `${requestId}|${String(isMockMode)}`;
    if (lastInitLogKeyRef.current === initLogKey) return;
    lastInitLogKeyRef.current = initLogKey;

    // 记录页面初始化日志
    logger.info({
      module: 'LoginPage',
      operate: 'init_page',
      requestId,
      params: { isMockMode },
      result: 'success'
    });
  }, [requestId, isMockMode]);

  /**
   * 异步加载页面动态配置信息
   * @description 获取 UI 展示相关的标题、副标题及已激活的社交登录渠道
   * @returns {Promise<void>}
   */
  const loadPageConfig = useCallback(async (): Promise<void> => {
    const loadKey = `${requestId}|${String(isMockMode)}`;

    // 防止重复请求的幂等检查
    if (lastConfigLoadKeyRef.current === loadKey) return;
    lastConfigLoadKeyRef.current = loadKey;

    setIsConfigLoading(true);
    try {
      // 1. 调用 API 获取标准响应结构
      const res = await fetchLoginConfig();

      // 2. 检查业务成功状态
      if (isApiSuccess(res) && res.data) {
        // 适配点：提取真正的配置数据存储到状态中
        setPageConfig(res.data);

        logger.info({
          module: 'LoginPage',
          operate: 'loadPageConfig_SUCCESS',
          requestId,
          result: 'success'
        });
      } else {
        // 处理业务级失败
        logger.error({
          module: 'LoginPage',
          operate: 'loadPageConfig_BIZ_FAIL',
          error: res.message || '获取配置失败',
          errorType: 'BIZ_LOGIC_ERROR',
          requestId
        });
      }
    } catch (error) {
      // 3. 处理网络或系统异常，严格遵循 ERROR 级别日志规范
      logger.error({
        module: 'LoginPage',
        operate: 'loadPageConfig_EXCEPTION',
        error: error instanceof Error ? error.message : String(error),
        errorType: 'API_FETCH_ERROR',
        requestId
      });
    } finally {
      setIsConfigLoading(false);
    }
  }, [isMockMode, requestId]);

  useEffect(() => {
    loadPageConfig();
  }, [loadPageConfig]);

  /**
   * 动态计算安全区域样式，适配异形屏
   * @type {ViewStyle}
   */
  const safeAreaContainerStyle = useMemo<ViewStyle>(() => ({
    ...styles.container,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  }), [insets.top, insets.bottom]);

  /**
   * 三方登录平台列表计算逻辑
   * @description 过滤逻辑：allPlatforms ∩ activeSocialPlatforms
   * @type {SocialItemProps[]}
   */
  const socialPlatforms = useMemo<SocialItemProps[]>(() => {
    const allPlatforms: SocialItemProps[] = [
      { id: 'wechat', emoji: '💬', label: '微信' },
      { id: 'qq', emoji: '🐧', label: 'QQ' },
      { id: 'apple', emoji: '🍎', label: 'Apple' },
    ];

    if (!pageConfig?.activeSocialPlatforms) return [];
    return allPlatforms.filter(p => pageConfig.activeSocialPlatforms.includes(p.id));
  }, [pageConfig?.activeSocialPlatforms]);

  /**
   * 切换密码输入框的可视状态
   */
  const togglePasswordVisibility = useCallback((): void => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  return (
    <View style={safeAreaContainerStyle}>
      {/* 顶部工具栏：语言切换 + 环境开关 */}
      <View style={styles.envSwitcher}>
        <LanguageSwitch compact />
        <View style={styles.envSwitcherRight}>
          <Text style={styles.envLabel}>{isMockMode ? "Mock" : "API"}</Text>
          <Switch
            value={!isMockMode}
            onValueChange={(val) => toggleMockMode(!val)}
            trackColor={{ false: COLORS.textMuted, true: COLORS.primary }}
            thumbColor={COLORS.white}
            style={SWITCH_SCALE_STYLE}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 头部视觉装饰区 */}
          <View style={styles.header}>
            <View style={styles.headerCircleDecoration} />
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🚗</Text>
            </View>
            {isConfigLoading ? (
              <ActivityIndicator color={COLORS.white} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <>
                <Text style={styles.titleText}>{pageConfig?.title}</Text>
                <Text style={styles.subtitleText}>{pageConfig?.subtitle}</Text>
              </>
            )}
          </View>

          <View style={styles.formContainer}>
            {/* 手机号输入模块 */}
            <View style={styles.inputFieldGroup}>
              <Label>手机号</Label>
              <View style={styles.inputControlWrapper}>
                <View style={styles.phonePrefixContainer}>
                  <Feather name="phone" size={16} color={COLORS.textMuted} />
                  <Text style={styles.prefixLabel}>{DEFAULT_PHONE_PREFIX}</Text>
                </View>
                <TextInput
                  placeholder="请输入手机号"
                  value={state.phone}
                  onChangeText={actions.setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                  style={styles.flexInputField}
                  placeholderTextColor={COLORS.textPlaceholder}
                />
              </View>
              {!!state.errors.phone && (
                <Text style={styles.validationErrorMessage}>{state.errors.phone}</Text>
              )}
            </View>

            {/* 密码输入模块 */}
            <View style={styles.inputFieldGroup}>
              <Label>密码</Label>
              <View style={styles.inputControlWrapper}>
                <Feather name="lock" size={16} color={COLORS.textMuted} />
                <TextInput
                  placeholder="请输入密码"
                  value={state.password}
                  secureTextEntry={!isPasswordVisible}
                  onChangeText={actions.setPassword}
                  style={styles.flexInputField}
                  placeholderTextColor={COLORS.textPlaceholder}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={togglePasswordVisibility}
                >
                  <Feather
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={16}
                    color={COLORS.textMuted}
                  />
                </Button>
              </View>
              {!!state.errors.password && (
                <Text style={styles.validationErrorMessage}>{state.errors.password}</Text>
              )}
            </View>

            {/* 表单辅助选项 */}
            <View style={styles.formOptionsRow}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  checked={state.shouldRemember}
                  onCheckedChange={actions.setShouldRemember}
                />
                <Text
                  style={styles.secondaryLabel}
                  onPress={() => actions.setShouldRemember(!state.shouldRemember)}
                >
                  记住我
                </Text>
              </View>
              <Button
                variant="link"
                size="sm"
                onPress={() => router.push(ROUTES.AUTH.FORGET_PASSWORD)}
              >
                <Text style={styles.primaryLinkText}>忘记密码？</Text>
              </Button>
            </View>

            {/* 提交异常告警展示 */}
            {!!state.errors.submission && (
              <Alert variant="destructive" style={styles.errorAlertMargin}>
                <Text style={styles.errorAlertText}>{state.errors.submission}</Text>
              </Alert>
            )}

            {/* 登录操作按钮 */}
            <Button
              size="lg"
              onPress={actions.handleLogin}
              disabled={state.isLoading}
              style={styles.mainSubmitButton}
            >
              {state.isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonLabelText}>立即登录</Text>
              )}
            </Button>

            {/* 第三方登录分割线 */}
            <View style={styles.dividerWrapper}>
              <Separator style={styles.horizontalLine} />
              <Text style={styles.dividerLabel}>其他登录方式</Text>
              <Separator style={styles.horizontalLine} />
            </View>

            {/* 社交平台登录列表 */}
            <View style={styles.socialActionContainer}>
              {socialPlatforms.map(item => (
                <SocialChannelItem key={item.id} {...item} />
              ))}
            </View>

            {/* 底部跳转注册区块 */}
            <View style={styles.footerContainer}>
              <Text style={styles.secondaryLabel}>还没有账号？</Text>
              <Button
                variant="link"
                style={styles.footerInlineBtn}
                onPress={() => router.push(ROUTES.AUTH.REGISTER)}
              >
                <Text style={styles.primaryHighlightText}>立即注册</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
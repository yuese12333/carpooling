/**
 * 登录页（LoginPage）
 * 说明：目前仅保留登录界面的输入与本地校验反馈，不实现后端请求与路由跳转。
 * 调试：Android + __DEV__ 时底部显示「地图 SDK 测试」区块，用于验证高德原生接入（/map-test）。
 */

import Feather from '@expo/vector-icons/Feather';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 登录页面组件
 * - 仅做手机号/密码校验，并提供加载态与错误提示
 * - 不包含登录跳转/接口请求逻辑
 */
export default function LoginPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [pwdError, setPwdError] = useState('');

  const safeAreaInsetsStyle = useMemo(
    () => ({
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }),
    [insets.top, insets.bottom, insets.left, insets.right],
  );

  const validatePhone = useMemo(
    () => (v: string) => {
      if (!v) return '请输入手机号';
      if (!/^1[3-9]\\d{9}$/.test(v)) return '请输入正确的手机号';
      return '';
    },
    [],
  );

  const validatePwd = useMemo(
    () => (v: string) => {
      if (!v) return '请输入密码';
      if (v.length < 6) return '密码不能少于6位';
      return '';
    },
    [],
  );

  /**
   * 处理登录按钮点击
   * 注意：当前仅模拟加载态，不实现真实登录逻辑与路由跳转
   */
  const handleLogin = async () => {
    const pe = validatePhone(phone);
    const we = validatePwd(password);
    setPhoneError(pe);
    setPwdError(we);
    if (pe || we) return;

    // 不实现按钮后的跳转/后端请求逻辑，仅保留校验后的本地反馈
    setLoading(true);
    setError('');
    try {
      await new Promise<void>((r) => setTimeout(() => r(), 600));
      // 模拟“登录成功后由外部接管路由”，此处不做跳转
    } catch {
      setError('手机号或密码错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.safeArea, safeAreaInsetsStyle]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />

          <View style={styles.headerInner}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerEmoji}>🚗</Text>
            </View>
            <Text style={styles.headerTitle}>欢迎回来</Text>
            <Text style={styles.headerSubtitle}>登录您的拼车账号</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>手机号</Text>
            <View
              style={[styles.inputRow, phoneError ? styles.inputRowError : undefined]}
            >
              <Feather name="phone" size={18} color="#9ca3af" />
              <Text style={styles.prefixText}>+86</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                placeholder="请输入手机号"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={11}
                onChangeText={(t) => {
                  const cleaned = t.replace(/\D/g, '');
                  setPhone(cleaned);
                  if (phoneError) setPhoneError('');
                }}
                onBlur={() => setPhoneError(validatePhone(phone))}
              />
              {phone.length === 11 && !phoneError ? (
                <View style={styles.validDot}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              ) : null}
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          <View style={[styles.fieldBlock, { marginBottom: 14 }]}>
            <Text style={styles.label}>密码</Text>
            <View
              style={[styles.inputRow, pwdError ? styles.inputRowError : undefined]}
            >
              <Feather name="lock" size={18} color="#9ca3af" />
              <TextInput
                style={styles.textInput}
                value={password}
                placeholder="请输入密码"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPwd}
                onChangeText={(t) => {
                  setPassword(t);
                  if (pwdError) setPwdError('');
                }}
                onBlur={() => setPwdError(validatePwd(password))}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPwd((v) => !v)}
                style={styles.iconButton}
              >
                <Feather
                  name={showPwd ? 'eye-off' : 'eye'}
                  size={18}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            {pwdError ? <Text style={styles.errorText}>{pwdError}</Text> : null}
          </View>

          <View style={styles.rememberRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRemember((v) => !v)}
              style={styles.rememberLeft}
            >
              <View
                style={[styles.checkbox, remember ? styles.checkboxChecked : undefined]}
              >
                {remember ? <Feather name="check" size={12} color="#fff" /> : null}
              </View>
              <Text style={styles.rememberText}>记住我</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
              <Text style={styles.linkText}>忘记密码？</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
            style={[
              styles.loginButton,
              loading ? styles.loginButtonDisabled : undefined,
            ]}
          >
            {loading ? (
              <View style={styles.loginButtonContent}>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.loginButtonText}>登录中...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>登录</Text>
            )}
          </TouchableOpacity>

          <View style={styles.hintBox}>
            <Text style={styles.hintText}>演示账号：任意手机号 + 6位以上密码即可登录</Text>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>其他登录方式</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialButton emoji="💬" label="微信" bgColor="#ecfdf3" />
            <SocialButton emoji="🐧" label="QQ" bgColor="#eff6ff" />
            <SocialButton emoji="🍎" label="Apple" bgColor="#f3f4f6" />
          </View>

          <View style={styles.registerPromptContainer}>
            <Text style={styles.registerPrompt}>还没有账号？</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
              <Text style={styles.registerLink}>立即注册</Text>
            </TouchableOpacity>
          </View>

          {/*
           * ---------------------------------------------------------------------------
           * DEBUG：高德地图原生 SDK 自检（仅 Android + __DEV__）
           * - 路由：/map-test
           * - 正式包不展示；与业务登录无关
           * ---------------------------------------------------------------------------
           */}
          {Platform.OS === 'android' && __DEV__ ? (
            <View style={styles.mapTestDebugBlock}>
              <Text style={styles.mapTestDebugLabel}>调试入口</Text>
              <Text style={styles.mapTestDebugDesc}>
                仅开发模式显示。用于验证高德 2D 地图原生 SDK（需已执行 `expo run:android` 且配置
                .env 中的 Key），与正式登录流程无关。
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/map-test')}
                style={styles.mapTestEntry}
              >
                <Text style={styles.mapTestEntryText}>打开地图 SDK 测试页</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {/* --------------------------------------------------------------------------- END DEBUG */}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * 社交登录按钮（示例）
 * 说明：当前不实现点击后的实际跳转逻辑
 */
function SocialButton({
  emoji,
  label,
  bgColor,
}: {
  emoji: string;
  label: string;
  bgColor: string;
}) {
  const socialBtnBgStyle = useMemo(
    () => ({ backgroundColor: bgColor }),
    [bgColor],
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => {}}>
      <View style={[styles.socialBtnBox, socialBtnBgStyle]}>
        <Text style={styles.socialEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#14b8a6',
  },
  circleTopRight: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -28,
    left: -22,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerInner: {
    alignItems: 'flex-start',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  fieldBlock: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputRowError: {
    borderColor: '#fecaca',
  },
  prefixText: {
    fontSize: 14,
    color: '#9ca3af',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  iconButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  validDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#ef4444',
    paddingLeft: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 6,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  rememberText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  errorBoxText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#22c55e',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  hintBox: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  hintText: {
    color: '#3b82f6',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 16,
  },
  registerPromptContainer: {
    paddingTop: 6,
  },
  socialBtnBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialEmoji: {
    fontSize: 22,
  },
  socialLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 6,
  },
  registerPrompt: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  registerLink: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },

  /* ---------------------------------------------------------------------------
   * DEBUG：高德地图 SDK 测试区块样式（与上方 JSX 调试入口对应）
   * --------------------------------------------------------------------------- */
  mapTestDebugBlock: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde047',
  },
  mapTestDebugLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a16207',
    marginBottom: 6,
  },
  mapTestDebugDesc: {
    fontSize: 11,
    color: '#854d0e',
    lineHeight: 16,
    marginBottom: 10,
  },
  mapTestEntry: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  mapTestEntryText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  /* END DEBUG styles */
});


/**
 * @file forget-password.tsx
 * @description 找回密码主页面容器，负责步骤分发与链路起点日志记录。
 */

import React, { useMemo, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTES } from '@/router/paths';
import logger, { generateRequestId } from '@/utils/logger';
import forgetPasswordStyles, { COLORS } from './forget-password.style';
import { useForgetPasswordForm } from "@/hooks/use-forget-password-form";

import { PasswordHeader } from './components/password-header';
import { StepPhoneInput } from './components/step-phone-input';
import { StepVerifyOtp } from './components/step-verify-otp';
import { StepResetPassword } from './components/step-reset-password';
import { StepSuccess } from './components/step-success';

export default function ForgetPasswordPage() {
  const requestId = useMemo(() => generateRequestId(), []);
  const form = useForgetPasswordForm(requestId);

  useEffect(() => {
    // Page 层负责业务流程起点的 info 日志记录
    logger.info({
      module: 'Auth_ForgetPassword',
      operate: 'PAGE_ENTRY',
      params: undefined,
      result: 'Success',
      requestId
    });
  }, [requestId]);

  const strengthInfo = useMemo(() => {
    const s = form.pwdStrength;
    if (s <= 25) return { text: "弱", color: COLORS.strengthWeak, textColor: COLORS.error };
    if (s <= 50) return { text: "中", color: COLORS.strengthMedium, textColor: COLORS.strengthMedium };
    if (s <= 75) return { text: "强", color: COLORS.strengthStrong, textColor: COLORS.strengthStrong };
    return { text: "极强", color: COLORS.strengthVeryStrong, textColor: COLORS.primaryDark };
  }, [form.pwdStrength]);

  const headerConfig = useMemo(() => ({
    1: { title: "账号安全", subtitle: "验证您的手机号码" },
    2: { title: "账号安全", subtitle: "输入 6 位验证码" },
    3: { title: "账号安全", subtitle: "请设置您的新密码" },
    4: { title: "操作成功", subtitle: "流程已完成，正在跳转" },
  }[form.step]), [form.step]);

  return (
    <SafeAreaView style={forgetPasswordStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={forgetPasswordStyles.flexCenter}
      >
        <View style={forgetPasswordStyles.card}>
          <PasswordHeader
            step={form.step}
            title={headerConfig?.title || ""}
            subtitle={headerConfig?.subtitle || ""}
            onBack={() => {
              if (form.step > 1 && form.step < 4) {
                form.setStep((form.step - 1) as any);
              } else {
                form.router.push(ROUTES.AUTH.LOGIN);
              }
            }}
          />

          <View style={forgetPasswordStyles.formContent}>
            {form.step === 1 && (
              <StepPhoneInput
                phone={form.phone}
                error={form.errors.phone}
                loading={form.loading}
                onChangePhone={(val) => { form.setPhone(val); form.setErrors({}); }}
                onSubmit={form.handleInitiateReset}
              />
            )}

            {form.step === 2 && (
              <StepVerifyOtp
                phone={form.phone}
                code={form.code}
                countdown={form.countdown}
                loading={form.loading}
                codeRefs={form.codeRefs}
                onCodeChange={form.handleCodeChange}
                onKeyDown={form.handleKeyDown}
                onResend={form.handleInitiateReset}
                onSubmit={() => form.verifySmsCode(form.code.join(""))}
              />
            )}

            {form.step === 3 && (
              <StepResetPassword
                password={form.password}
                confirmPwd={form.confirmPwd}
                showPwd={form.showPwd}
                showConfirm={form.showConfirm}
                errors={form.errors}
                pwdStrength={form.pwdStrength}
                loading={form.loading}
                onTogglePwd={() => form.setShowPwd(!form.showPwd)}
                onToggleConfirm={() => form.setShowConfirm(!form.showConfirm)}
                onPasswordChange={form.setPassword}
                onConfirmPwdChange={form.setConfirmPwd}
                onSubmit={form.handleFinalSubmit}
                strengthInfo={strengthInfo}
              />
            )}

            {form.step === 4 && <StepSuccess />}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
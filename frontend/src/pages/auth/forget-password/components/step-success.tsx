/**
 * @file step-success.tsx
 * @description 找回密码流程第四步：重置成功反馈组件。展示成功状态及装饰点布局。
 */

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2 } from "lucide-react-native";
import forgetPasswordStyles, { COLORS } from '../forget-password.style';
import { useEnvStore } from '@/store/env-store';
import logger from '@/utils/logger';

/**
 * 成功反馈组件
 * 职责：展示成功状态，记录业务完结日志
 */
export const StepSuccess: React.FC = () => {
    // 获取全局链路跟踪 ID
    const requestId = useEnvStore.getState().currentRequestId;

    useEffect(() => {
        // 记录业务流程最终完结审计日志
        logger.info({
            module: 'Auth_ForgetPassword',
            operate: 'FLOW_COMPLETED_SUCCESSFULLY',
            params: undefined,
            result: 'Success Screen Displayed',
            requestId
        });
    }, [requestId]);

    return (
        <View style={forgetPasswordStyles.successWrapper}>
            <View style={forgetPasswordStyles.successIconContainer}>
                <CheckCircle2 size={56} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <Text style={forgetPasswordStyles.successTitle}>设置成功</Text>
            <Text style={forgetPasswordStyles.successSubtitle}>您的账号安全信息已更新，即将跳转。</Text>

            {/* 装饰点布局 */}
            <View style={forgetPasswordStyles.dotContainer}>
                <View style={forgetPasswordStyles.dot} />
                <View style={[forgetPasswordStyles.dot, forgetPasswordStyles.dotOpacity6]} />
                <View style={[forgetPasswordStyles.dot, forgetPasswordStyles.dotOpacity3]} />
            </View>
        </View>
    );
};

export default StepSuccess;
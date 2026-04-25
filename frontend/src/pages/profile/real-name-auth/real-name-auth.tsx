/**
 * @file real-name-auth.tsx
 * @description 实名认证页面视图层，处理用户信息录入、状态展示及链路追踪注入
 */

import React, { useMemo } from 'react';
import {
    View,
    Text,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ShieldCheck,
    User,
    CreditCard,
    CheckCircle2,
    Info,
    Lock,
} from 'lucide-react-native';

// 日志与追踪
import { generateRequestId } from '@/utils/logger';

// 样式导入
import { LAYOUT_MIXINS, commonStyles } from '@/pages/style';
import styles, { COLORS } from './real-name-auth.style';

// 逻辑 Hook 导入
import { useRealNameAuthForm } from '@/hooks/use-real-name-auth-form';

export default function RealNameAuthPage() {
    /**
     * [核心规范] 链路追踪 ID 独立化
     * 使用 useMemo 确保 requestId 在页面生命周期内唯一且稳定
     */
    const requestId = useMemo(() => generateRequestId(), []);

    // 逻辑委托给 Hook，显式注入 requestId
    const {
        isVerified,
        loading,
        submitting,
        name,
        idNumber,
        authData,
        setName,
        setIdNumber,
        handleVerify,
        handleBack,
    } = useRealNameAuthForm(requestId);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.indicatorColor} />
            </View>
        );
    }

    return (
        <SafeAreaView style={commonStyles.safeAreaContainer} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 顶部导航 */}
            <View style={LAYOUT_MIXINS.navbar}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={LAYOUT_MIXINS.hitSlop}
                    activeOpacity={0.7}
                >
                    <ChevronLeft color={COLORS.textMain} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>实名认证</Text>
                {/* 右侧对齐占位 */}
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    // [核心规范] 修复键盘弹出时点击被“吞掉”的问题
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 状态 Banner */}
                    <View
                        style={[
                            styles.statusBanner,
                            isVerified ? styles.bgVerified : styles.bgUnverified
                        ]}
                    >
                        <View
                            style={[
                                styles.iconCircle,
                                { backgroundColor: isVerified ? COLORS.white : COLORS.statusIconBg }
                            ]}
                        >
                            {isVerified ? (
                                <ShieldCheck size={40} color={COLORS.primary} />
                            ) : (
                                <Lock size={40} color={COLORS.primary} />
                            )}
                        </View>
                        <Text style={styles.statusTitle}>
                            {isVerified ? '已完成实名认证' : '待完成实名认证'}
                        </Text>
                        <Text style={styles.statusDesc}>
                            {isVerified
                                ? '您的身份信息已核验，账号安全等级：高'
                                : '根据相关法律要求，拼车前需完成实名信息核验'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {isVerified ? (
                            <View style={styles.verifiedCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>真实姓名</Text>
                                    <Text style={styles.infoValue}>{authData.realName || undefined}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>证件类型</Text>
                                    <Text style={styles.infoValue}>{authData.idType || '中国居民身份证'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>证件号码</Text>
                                    <Text style={styles.infoValue}>{authData.idCardNo || undefined}</Text>
                                </View>
                                <View style={styles.verifiedTag}>
                                    <CheckCircle2 size={14} color={COLORS.primary} />
                                    <Text style={styles.verifiedTagText}>身份核验已通过</Text>
                                </View>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sectionLabel}>身份信息</Text>
                                <View style={styles.inputGroup}>
                                    <View style={commonStyles.inputWrapper}>
                                        <User size={20} color={COLORS.textMuted} />
                                        <TextInput
                                            placeholder="请输入真实姓名"
                                            style={styles.textInput}
                                            value={name}
                                            onChangeText={setName}
                                            placeholderTextColor={COLORS.textPlaceholder}
                                            editable={!submitting}
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={commonStyles.inputWrapper}>
                                        <CreditCard size={20} color={COLORS.textMuted} />
                                        <TextInput
                                            placeholder="请输入身份证号"
                                            style={styles.textInput}
                                            value={idNumber}
                                            onChangeText={setIdNumber}
                                            keyboardType="numbers-and-punctuation"
                                            placeholderTextColor={COLORS.textPlaceholder}
                                            editable={!submitting}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>

                                <View style={styles.tipsBox}>
                                    <Info size={16} color={COLORS.textMuted} />
                                    <Text style={styles.tipsText}>
                                        身份信息仅用于公安部核验，平台将严格保障您的数据安全。
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* 底部按钮区域 */}
                {!isVerified && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                commonStyles.primaryButton,
                                (!name || !idNumber || submitting) && styles.disabledButton
                            ]}
                            onPress={handleVerify}
                            disabled={!name || !idNumber || submitting}
                            activeOpacity={0.8}
                        >
                            {submitting ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={commonStyles.primaryButtonText}>提交认证</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
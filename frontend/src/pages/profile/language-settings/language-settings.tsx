/**
 * @file language-settings.tsx
 * @description 语言设置页面
 */

import React, { useMemo, JSX } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';

import { ROUTES } from "@/router/paths";
import { generateRequestId } from '@/utils/logger';
import { useLanguageStore } from '@/store/language-store';
import { t } from '@/i18n';
import { COLORS } from "@/pages/style";

export default function LanguageSettingsPage(): JSX.Element {
    const requestId = useMemo(() => generateRequestId(), []);
    const router = useRouter();
    const { language, setLanguage, supportedLanguages } = useLanguageStore();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← {t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('settings.language')}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* 说明 */}
            <View style={styles.notice}>
                <Text style={styles.noticeText}>
                    {language === 'zh'
                        ? '选择您偏好的语言，更改后将立即生效'
                        : 'Select your preferred language. Changes take effect immediately.'}
                </Text>
            </View>

            {/* 语言列表 */}
            <ScrollView style={styles.listContainer}>
                {supportedLanguages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.languageItem,
                            language === lang.code && styles.activeItem,
                        ]}
                        onPress={() => setLanguage(lang.code)}
                    >
                        <View style={styles.languageInfo}>
                            <Text style={styles.languageNative}>{lang.nativeName}</Text>
                            <Text style={styles.languageName}>{lang.name}</Text>
                        </View>
                        {language === lang.code && (
                            <View style={styles.checkMark}>
                                <Text style={styles.checkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: COLORS.bgGrey,
    },
    header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: 8,
        width: 80,
    },
    backText: {
        fontSize: 16,
        color: COLORS.primary,
    },
    title: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: COLORS.textPrimary,
    },
    placeholder: {
        width: 80,
    },
    notice: {
        backgroundColor: COLORS.bgBlueLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
    },
    noticeText: {
        fontSize: 13,
        color: COLORS.primaryDark,
        lineHeight: 20,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    languageItem: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    activeItem: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    languageInfo: {
        flex: 1,
    },
    languageNative: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: COLORS.textPrimary,
    },
    languageName: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    checkMark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    checkText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "bold" as const,
    },
};

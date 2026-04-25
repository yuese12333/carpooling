/**
 * @file help-center.tsx
 * @description 帮助中心页面入口，负责搜索、分类导航、热门问题展示及客服引导。
 * @version 1.1.0
 */

import React, { useMemo, useEffect } from "react";
import {
    View,
    Text,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
// 规范：统一使用 react-native-safe-area-context
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    Search,
    MessageSquare,
    Phone,
    MapPin,
    CreditCard,
    User,
    ShieldCheck,
    HelpCircle
} from "lucide-react-native";
import { List, Divider } from 'react-native-paper';

// 样式与常量导入
import styles, { COLORS } from "./help-center.style";
import { LAYOUT_MIXINS, commonStyles } from "@/pages/style";

// 逻辑 Hook 导入
import { useHelpCenterForm } from "@/hooks/use-help-center-form";

// 审计：引入链路追踪与日志模块
import logger, { generateRequestId } from '@/utils/logger';

/** 映射图标名称到组件 */
const ICON_MAP: Record<string, React.ReactNode> = {
    'MapPin': <MapPin size={24} color={COLORS.primary} />,
    'CreditCard': <CreditCard size={24} color={COLORS.secondary} />,
    'User': <User size={24} color={COLORS.warning} />,
    'ShieldCheck': <ShieldCheck size={24} color={COLORS.error} />,
};

export default function HelpCenterPage() {
    const router = useRouter();

    // 规范：页面级 requestId 独立化生成，确保生命周期内稳定且唯一
    const requestId = useMemo(() => generateRequestId(), []);

    // 规范：将 requestId 显式注入自定义 Hook
    const {
        searchQuery,
        setSearchQuery,
        expandedId,
        handleAccordionPress,
        categories,
        questions
    } = useHelpCenterForm(requestId);

    // 页面曝光日志记录
    useEffect(() => {
        logger.info({
            module: 'HelpCenter',
            operate: 'page_view',
            params: undefined,
            result: 'Enter HelpCenterPage',
            requestId
        });
    }, [requestId]);

    return (
        <SafeAreaView style={commonStyles.safeAreaContainer} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* 导航栏 */}
            <View style={LAYOUT_MIXINS.navbar}>
                <TouchableOpacity
                    onPress={() => {
                        logger.info({ module: 'HelpCenter', operate: 'click_back', requestId });
                        router.back();
                    }}
                    style={LAYOUT_MIXINS.hitSlop}
                >
                    <ChevronLeft color={COLORS.textMain} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>帮助中心</Text>
                <TouchableOpacity style={LAYOUT_MIXINS.hitSlop}>
                    <HelpCircle color={COLORS.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                // 规范：修复键盘弹出时点击被“吞掉”的问题
                keyboardShouldPersistTaps="handled"
            >
                {/* 搜索区域 */}
                <View style={styles.searchSection}>
                    <Text style={styles.searchGreeting}>您好，请问有什么可以帮您？</Text>
                    <View style={commonStyles.inputWrapper}>
                        <Search size={20} color={COLORS.textMuted} />
                        <TextInput
                            placeholder="搜索常见问题..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={(text) => {
                                // 规范：输入行为应可选记录日志
                                setSearchQuery(text);
                            }}
                            placeholderTextColor={COLORS.textPlaceholder}
                        />
                    </View>
                </View>

                {/* 分类入口 */}
                <View style={styles.categoryGrid}>
                    {categories.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.categoryItem}
                            onPress={() => {
                                logger.info({
                                    module: 'HelpCenter',
                                    operate: 'click_category',
                                    params: { categoryId: item.id, title: item.title },
                                    requestId
                                });
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                {ICON_MAP[item.iconName] || <HelpCircle size={24} color={COLORS.textMuted} />}
                            </View>
                            <Text style={styles.categoryTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 热门问题列表 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>猜你想问</Text>
                </View>

                <View style={styles.qaContainer}>
                    <List.Section>
                        {questions.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <List.Accordion
                                    title={item.q}
                                    titleStyle={styles.questionText}
                                    titleNumberOfLines={0}
                                    expanded={expandedId === item.id}
                                    onPress={() => handleAccordionPress(item.id)}
                                    style={styles.accordionHeader}
                                >
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerText}>{item.a}</Text>
                                    </View>
                                </List.Accordion>
                                {index < questions.length - 1 && <Divider style={styles.divider} />}
                            </React.Fragment>
                        ))}
                    </List.Section>
                </View>

                {/* 客服入口 */}
                <View style={styles.serviceCardsRow}>
                    <TouchableOpacity
                        style={[styles.serviceCard, LAYOUT_MIXINS.rowCenter]}
                        onPress={() => {
                            logger.info({ module: 'HelpCenter', operate: 'contact_online_service', requestId });
                        }}
                    >
                        <MessageSquare size={20} color={COLORS.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.serviceMainText}>在线客服</Text>
                            <Text style={styles.serviceSubText}>8:00 - 22:00</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.serviceCard, LAYOUT_MIXINS.rowCenter]}
                        onPress={() => {
                            logger.info({ module: 'HelpCenter', operate: 'contact_phone_call', requestId });
                        }}
                    >
                        <Phone size={20} color={COLORS.secondary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.serviceMainText}>电话热线</Text>
                            <Text style={styles.serviceSubText}>24小时在线</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
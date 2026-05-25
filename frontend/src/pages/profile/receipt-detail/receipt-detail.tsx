/**
 * @file receipt-detail.tsx
 * @description 交易凭证详情页面，集成全链路追踪与标准化交互规范
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 修复：使用标准库
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ChevronLeft,
    Share2,
    Download,
    Mail,
    Headphones,
    CheckCircle2,
    Copy,
    CreditCard
} from "lucide-react-native";

// 导入项目组件
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/separator";

// 导入逻辑 Hook 与工具
import { useReceiptDetail } from "@/hooks/use-receipt-detail-form";
import logger, { generateRequestId } from '@/utils/logger';

// 导入样式
import styles, { COLORS } from "./receipt-detail.style";

export default function ReceiptDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const receiptId = Array.isArray(id) ? id[0] : id;

    /**
     * 1. 链路追踪初始化
     * 确保页面生命周期内 requestId 唯一且稳定，严禁跨页面复用
     */
    const requestId = useMemo(() => generateRequestId(), []);

    /**
     * 2. 注入 requestId 至业务 Hook
     * 严禁 Hook 内部隐式读取 Context 或 Store 中的 ID
     */
    const {
        loading,
        receiptData,
        handleShare,
        handleDownload,
        handleSendEmail,
        handleCopyOrderId,
        handleContactSupport
    } = useReceiptDetail(receiptId ?? '', requestId);

    // 交互日志封装
    const trackAndExecute = (actionName: string, execution: () => void) => {
        logger.info({
            module: 'ReceiptDetail',
            operate: actionName,
            params: { receiptId: id },
            result: 'User triggered action',
            requestId: requestId
        });
        execution();
    };

    // 加载状态 UI
    if (loading || !receiptData) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 顶部导航 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ChevronLeft color={COLORS.textMain} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>交易凭证</Text>
                <TouchableOpacity
                    style={styles.headerRight}
                    onPress={() => trackAndExecute('SHARE_TOP_NAV', handleShare)}
                >
                    <Share2 color={COLORS.textMain} size={22} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled" // 修复：防止键盘弹出时吞掉点击事件
            >
                {/* 电子凭证卡片 */}
                <View style={styles.receiptWrapper}>
                    <View style={styles.receiptCard}>
                        {/* 状态头部 */}
                        <View style={styles.receiptHeader}>
                            <View style={styles.successIconBg}>
                                <CheckCircle2 size={32} color={COLORS.white} />
                            </View>
                            <Text style={styles.merchantName}>{receiptData.merchant}</Text>
                            <View style={styles.amountContainer}>
                                <Text style={styles.currencySymbol}>￥</Text>
                                <Text style={styles.amountValue}>{receiptData.amount}</Text>
                            </View>
                            <Badge variant="success" className="px-4 py-1">已支付</Badge>
                        </View>

                        <View style={styles.dottedLineContainer}>
                            <View style={styles.leftCutout} />
                            <View style={styles.dottedLine} />
                            <View style={styles.rightCutout} />
                        </View>

                        {/* 明细信息区 */}
                        <View style={styles.receiptBody}>
                            <Text style={styles.sectionTitle}>行程信息</Text>
                            <View style={styles.routeBox}>
                                <View style={styles.routeLine}>
                                    <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                                    <View style={styles.line} />
                                    <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                                </View>
                                <View style={styles.routeTexts}>
                                    <Text style={styles.locationText} numberOfLines={1}>{receiptData.route.from}</Text>
                                    <Text style={[styles.locationText, { marginTop: 12 }]} numberOfLines={1}>{receiptData.route.to}</Text>
                                </View>
                            </View>

                            <Separator style={styles.bodySeparator} />

                            {/* 列表条目 */}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>付款时间</Text>
                                <Text style={styles.infoValue}>{receiptData.time}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>支付方式</Text>
                                <View style={styles.rowRight}>
                                    <CreditCard size={14} color={COLORS.textSecondary} />
                                    <Text style={[styles.infoValue, { marginLeft: 4 }]}>{receiptData.method}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>订单编号</Text>
                                <TouchableOpacity
                                    style={styles.rowRight}
                                    onPress={() => trackAndExecute('COPY_ORDER_ID', () => handleCopyOrderId(receiptData.orderId))}
                                >
                                    <Text style={styles.infoValue}>{receiptData.orderId}</Text>
                                    <Copy size={12} color={COLORS.secondary} style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>交易单号</Text>
                                <Text style={styles.infoValue}>{receiptData.transactionId}</Text>
                            </View>
                        </View>

                        {/* 底部装饰 */}
                        <View style={styles.receiptFooterDecorator}>
                            {[...Array(15)].map((_, i) => (
                                <View key={i} style={styles.footerCircle} />
                            ))}
                        </View>
                    </View>
                </View>

                {/* 操作按钮区 */}
                <View style={styles.actionContainer}>
                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            style={styles.actionBtn}
                            onPress={() => trackAndExecute('DOWNLOAD_IMAGE', handleDownload)}
                        >
                            <Download size={18} color={COLORS.textMain} style={{ marginRight: 8 }} />
                            <Text>下载图片</Text>
                        </Button>
                        <Button
                            variant="outline"
                            style={styles.actionBtn}
                            onPress={() => trackAndExecute('SEND_EMAIL', handleSendEmail)}
                        >
                            <Mail size={18} color={COLORS.textMain} style={{ marginRight: 8 }} />
                            <Text>发至邮箱</Text>
                        </Button>
                    </View>

                    <TouchableOpacity
                        style={styles.supportLink}
                        onPress={() => trackAndExecute('CONTACT_SUPPORT', handleContactSupport)}
                    >
                        <Headphones size={16} color={COLORS.textMuted} />
                        <Text style={styles.supportText}>对该笔交易有疑问？联系客服</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
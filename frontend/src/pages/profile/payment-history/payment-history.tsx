/**
 * @file payment-history.tsx
 * @description 支付历史记录页面。集成高级筛选、月度统计展示及全链路追踪功能。
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Calendar,
    ReceiptText,
    ChevronRight
} from "lucide-react-native";
import { ROUTES } from "@/router/paths";

// 规范：导入标准日志工具与 ID 生成器
import logger, { generateRequestId } from '@/utils/logger';

// 样式与常量
import styles from "./payment-history.style";
import { COLORS } from "@/pages/style";

// 组件
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Separator } from "@/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/sheet";
import { Checkbox } from "@/components/checkbox";

// 导入自定义 Hook 与类型
import { usePaymentHistory } from "@/hooks/use-payment-history-form";
import { PaymentRecord } from "@/api/payment-history-api";

export default function PaymentHistoryPage() {
    const router = useRouter();

    // 核心规范：自生成页面级唯一 requestId，确保生命周期内稳定
    const requestId = useMemo(() => generateRequestId(), []);

    // 规范：显式将 requestId 注入 Hook，建立链路追踪
    const {
        activeTab,
        stats,
        loading,
        displayData,
        selectedStatus,
        statusMap,
        setActiveTab,
        toggleStatus,
        resetFilters
    } = usePaymentHistory(requestId);

    /**
     * 渲染单条历史记录
     * @param item 支付记录对象
     */
    const renderHistoryItem = (item: PaymentRecord) => (
        <Card key={item.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    {item.type === 'payment' ? (
                        <View style={[styles.typeIcon, { backgroundColor: COLORS.borderTip }]}>
                            <ArrowUpRight size={20} color={COLORS.primary} />
                        </View>
                    ) : (
                        <View style={[styles.typeIcon, { backgroundColor: COLORS.errorLight }]}>
                            <ArrowDownLeft size={20} color={COLORS.danger} />
                        </View>
                    )}
                    <View style={styles.titleWrapper}>
                        <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                </View>
                <View style={styles.amountWrapper}>
                    <Text style={[
                        styles.amountText,
                        { color: item.type === 'refund' ? COLORS.primary : COLORS.textMain }
                    ]}>
                        {item.type === 'refund' ? '+' : '-'}{item.amount.toFixed(2)}
                    </Text>
                    <Badge
                        variant={item.status === 'completed' ? 'success' : item.status === 'refunded' ? 'outline' : 'warning'}
                        className="mt-1"
                    >
                        {statusMap[item.status as keyof typeof statusMap]?.label || '未知'}
                    </Badge>
                </View>
            </View>

            <Separator style={styles.cardSeparator} />

            <View style={styles.cardFooter}>
                <View style={styles.methodInfo}>
                    <CreditCard size={14} color={COLORS.textMuted} />
                    <Text style={styles.methodText}>{item.method}</Text>
                </View>
                <TouchableOpacity
                    style={styles.receiptBtn}
                    onPress={() => {
                        logger.info({
                            module: 'PaymentHistory',
                            operate: 'view_receipt',
                            params: { id: item.id },
                            requestId
                        });
                        router.push({ pathname: ROUTES.PROFILE.RECEIPT_DETAIL, params: { id: item.id } });
                    }}
                >
                    <ReceiptText size={14} color={COLORS.info} />
                    <Text style={styles.receiptText}>查看凭证</Text>
                    <ChevronRight size={14} color={COLORS.info} />
                </TouchableOpacity>
            </View>
        </Card >
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 头部导航栏 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color={COLORS.textMain} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>支付记录</Text>

                <Sheet>
                    <SheetTrigger asChild>
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() => logger.info({ module: 'PaymentHistory', operate: 'open_filter_sheet', requestId })}
                        >
                            <Filter color={COLORS.textMain} size={22} />
                        </TouchableOpacity>
                    </SheetTrigger>
                    <SheetContent side="right" style={styles.filterSheet}>
                        <SheetHeader>
                            <SheetTitle>高级筛选</SheetTitle>
                        </SheetHeader>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>交易状态</Text>
                            <View style={styles.checkboxGroup}>
                                {Object.entries(statusMap).map(([status, config]) => (
                                    <View key={status} style={styles.checkboxItem}>
                                        <Checkbox
                                            checked={selectedStatus.includes(status)}
                                            onCheckedChange={() => toggleStatus(status)}
                                        />
                                        <Text style={{ marginLeft: 8, color: COLORS.textMain }}>
                                            {config.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <SheetFooter style={styles.buttonGroup}>
                            <Button variant="outline" style={styles.filterBtn} onPress={resetFilters}>
                                <Text>重置</Text>
                            </Button>
                            <SheetClose asChild>
                                <Button
                                    style={[styles.filterBtn, { backgroundColor: COLORS.primary }]}
                                    onPress={() => logger.info({ module: 'PaymentHistory', operate: 'apply_filter', params: { selectedStatus }, requestId })}
                                >
                                    <Text style={{ color: 'white' }}>确定</Text>
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </View>

            {/* 核心规范：添加 keyboardShouldPersistTaps 处理键盘交互隐患 */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* 统计统计卡片 */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                        <View>
                            <Text style={styles.statsLabel}>本月总支出 (元)</Text>
                            <Text style={styles.statsValue}>
                                ￥{stats?.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.calendarTag}>
                            <Calendar size={14} color={COLORS.white} />
                            <Text style={styles.calendarText}>{stats?.month || '--'}</Text>
                        </View>
                    </View>
                </View>

                {/* 类型切换 Tabs */}
                <View style={styles.tabsContainer}>
                    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                        <TabsList className="bg-transparent">
                            <TabsTrigger value="all" className={activeTab === 'all' ? 'text-emerald-600 border-b-2 border-emerald-600' : ''}>全部</TabsTrigger>
                            <TabsTrigger value="payments" className={activeTab === 'payments' ? 'text-emerald-600 border-b-2 border-emerald-600' : ''}>支付</TabsTrigger>
                            <TabsTrigger value="refunds" className={activeTab === 'refunds' ? 'text-emerald-600 border-b-2 border-emerald-600' : ''}>退款</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </View>

                {/* 列表渲染区域 */}
                <View style={styles.listContainer}>
                    {loading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator color={COLORS.primary} />
                            <Text style={{ marginTop: 8, color: COLORS.textMuted }}>正在获取流水...</Text>
                        </View>
                    ) : displayData.length > 0 ? (
                        displayData.map(renderHistoryItem)
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>暂无相关支付记录</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.bottomNote}>仅展示最近 6 个月的流水记录</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
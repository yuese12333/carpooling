/**
 * @file add-location.tsx
 * @description 新增常用地点页面组件。
 * 集成了 react-native-safe-area-context 适配、键盘交互修复及显式链路追踪。
 */

import React, { useEffect, useMemo } from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Tag } from "lucide-react-native";

// 导入自定义 Hook
import { useAddLocationForm } from "@/hooks/use-add-location-form";
// 导入样式
import styles, { COLORS } from './add-location.style';
// 导入日志工具
import logger, { generateRequestId } from '@/utils/logger';

// 引用组件库 (使用别名路径)
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Label } from "@/components/label";

/**
 * 新增常用地点页面
 * @returns {JSX.Element} 页面渲染结果
 */
export default function AddLocationPage() {
    const requestId = useMemo(() => generateRequestId(), []);

    // 1. 调用 Hook
    const {
        label,
        setLabel,
        address,
        setAddress,
        handleSave,
        loading,
    } = useAddLocationForm(requestId);

    // 2. 页面生命周期埋点：记录进入页面的初始状态
    useEffect(() => {
        logger.info({
            module: 'add-location-page',
            operate: 'page_enter',
            params: undefined,
            result: 'AddLocationPage mounted',
            requestId,
        });
    }, [requestId]);

    return (
        <SafeAreaView style={styles.container}>
            {/* 修复：使用 ScrollView 包装以支持长表单，并注入 keyboardShouldPersistTaps */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <Text style={styles.title}>新增常用地点</Text>

                    <View style={styles.form}>
                        <Label style={styles.label}>地点名称</Label>
                        <Input
                            placeholder="例如：家、公司、健身房"
                            value={label}
                            onChangeText={setLabel}
                            leftIcon={<Tag size={18} color={COLORS.iconDefault} />}
                        />

                        <View style={styles.spacer} />

                        <Label style={styles.label}>详细地址</Label>
                        <Input
                            placeholder="请输入详细地址"
                            value={address}
                            onChangeText={setAddress}
                            leftIcon={<MapPin size={18} color={COLORS.iconDefault} />}
                        />
                    </View>

                    {/* * 按钮组件封装：
                      * 1. 显式传递 requestId
                      * 2. loading 状态处理
                      */}
                    <Button
                        onPress={handleSave}
                        style={styles.saveBtn}
                        disabled={loading}
                    >
                        <Text style={styles.saveBtnText}>
                            {loading ? "保存中..." : "保存地点"}
                        </Text>
                    </Button>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}
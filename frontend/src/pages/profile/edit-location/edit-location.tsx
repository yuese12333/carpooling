/**
 * @file edit-location.tsx
 * @description 编辑常用地点页面 - 修复导航栏嵌套逻辑
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Tag, Save, ChevronLeft } from "lucide-react-native";

import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Label } from "@/components/label";

import styles from "./edit-location.style";
import { COLORS } from "@/pages/style";
import { useEditLocationForm } from "@/hooks/use-edit-location-form";
import { generateRequestId } from '@/utils/logger';

export default function EditLocationPage() {
    const requestId = useMemo(() => generateRequestId(), []);
    const { formData, status, methods } = useEditLocationForm(requestId);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* 导航栏 */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={methods.handleCancel} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textMain} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>编辑地点</Text>
                <View style={styles.backBtn} pointerEvents="none" />
            </View>

            {/* 2. KeyboardAvoidingView 应该是内容的容器 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formCard}>
                        <Label>地点名称</Label>
                        <Input
                            placeholder="如：家 / 公司"
                            value={formData.label}
                            onChangeText={methods.setLabel}
                            leftIcon={<Tag size={18} color={COLORS.iconDefault} />}
                            editable={!status.loading}
                        />

                        <View style={styles.inputSpacer} />

                        <Label>详细地址</Label>
                        <Input
                            placeholder="请输入详细地址"
                            value={formData.address}
                            onChangeText={methods.setAddress}
                            leftIcon={<MapPin size={18} color={COLORS.iconDefault} />}
                            multiline
                            editable={!status.loading}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button
                            onPress={methods.handleUpdate}
                            style={styles.updateBtn}
                            disabled={status.loading}
                        >
                            {status.loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <>
                                    <Save size={18} color={COLORS.white} style={styles.btnIcon} />
                                    <Text style={styles.btnText}>保存修改</Text>
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            onPress={methods.handleCancel}
                            style={styles.cancelBtn}
                            disabled={status.loading}
                        >
                            <Text style={styles.cancelText}>取消</Text>
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
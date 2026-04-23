/**
 * @file edit-vehicle-information.tsx
 * @description 车辆信息编辑页面，集成全链路追踪、键盘交互优化及标准 SafeArea 适配
 */

import React, { useMemo } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    ChevronLeft,
    Camera,
    Check,
    Info,
    AlertTriangle
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 导入自定义 UI 组件
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Switch } from "@/components/switch";
import { Separator } from "@/components/separator";

// 导入样式与业务逻辑 Hook
import styles, { COLORS } from "./edit-vehicle-information.style";
import { useEditVehicleForm } from "@/hooks/use-edit-vehicle-form";
import logger, { generateRequestId } from '@/utils/logger';

const MODULE_NAME = 'edit-vehicle-page';

/**
 * 车辆信息编辑页面组件
 * @returns {JSX.Element}
 */
export default function EditVehiclePage() {
    // 1. 初始化页面级唯一且稳定的 RequestId
    const requestId = useMemo(() => generateRequestId(), []);

    // 2. 注入业务逻辑，显式传递 requestId
    const {
        formData,
        isSubmitting,
        updateFormField,
        handleBack,
        handleSave
    } = useEditVehicleForm(requestId);

    /**
     * 内部保存处理函数，集成页面级日志
     */
    const onSavePress = async () => {
        logger.info({
            module: MODULE_NAME,
            operate: 'onSavePress',
            params: { brand: formData.brand },
            requestId
        });
        await handleSave();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 导航栏 */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.navButton}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.navTitle}>修改车辆信息</Text>

                <TouchableOpacity
                    onPress={onSavePress}
                    disabled={isSubmitting}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.saveText,
                        isSubmitting && styles.saveTextDisabled
                    ]}>
                        保存
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    // 修复键盘弹出时点击按键被“吞掉”的问题
                    keyboardShouldPersistTaps="handled"
                >

                    {/* 1. 照片上传区 */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity
                            style={styles.photoUploadBox}
                            activeOpacity={0.8}
                            onPress={() => {
                                logger.info({
                                    module: MODULE_NAME,
                                    operate: 'trigger_photo_upload',
                                    requestId
                                });
                            }}
                        >
                            <View style={styles.cameraCircle}>
                                <Camera size={28} color={COLORS.primary} />
                            </View>
                            <Text style={styles.uploadText}>更换车辆照片</Text>
                            <Text style={styles.uploadSubText}>建议上传侧前方45度清晰照</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 2. 基础信息卡片 */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>基础信息</Text>
                    </View>
                    <Card style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Label style={styles.label}>品牌</Label>
                            <Input
                                value={formData.brand}
                                onChangeText={(val: string) => updateFormField("brand", val)}
                                placeholder="例如：大众"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Label style={styles.label}>型号</Label>
                            <Input
                                value={formData.model}
                                onChangeText={(val: string) => updateFormField("model", val)}
                                placeholder="例如：帕萨特 2023款"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Label style={styles.label}>车牌号码</Label>
                            <Input
                                value={formData.plate}
                                onChangeText={(val: string) => updateFormField("plate", val)}
                                placeholder="例如：沪A 88888"
                                autoCapitalize="characters"
                            />
                            <View style={styles.inputHint}>
                                <Info size={12} color={COLORS.textMuted} />
                                <Text style={styles.hintText}>请确保与行驶证信息一致</Text>
                            </View>
                        </View>

                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                <Label style={styles.label}>车身颜色</Label>
                                <Input
                                    value={formData.color}
                                    onChangeText={(val: string) => updateFormField("color", val)}
                                    placeholder="颜色"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Label style={styles.label}>核载人数</Label>
                                <Input
                                    value={formData.seats}
                                    onChangeText={(val: string) => updateFormField("seats", val)}
                                    keyboardType="numeric"
                                    placeholder="含司机"
                                />
                            </View>
                        </View>
                    </Card>

                    {/* 3. 车辆设置与偏好 */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>偏好设置</Text>
                    </View>
                    <Card style={styles.formCard}>
                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>全程禁烟</Text>
                                <Text style={styles.switchSub}>开启后将提醒乘客请勿在车内吸烟</Text>
                            </View>
                            <Switch
                                checked={formData.isNonSmoking}
                                onCheckedChange={(val: boolean) => updateFormField("isNonSmoking", val)}
                            />
                        </View>

                        <Separator style={styles.innerSeparator} />

                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>空调开启</Text>
                                <Text style={styles.switchSub}>承诺行程中提供适宜的冷/暖气</Text>
                            </View>
                            <Switch
                                checked={formData.hasAirConditioner}
                                onCheckedChange={(val: boolean) => updateFormField("hasAirConditioner", val)}
                            />
                        </View>

                        <Separator style={styles.innerSeparator} />

                        <View style={styles.switchItem}>
                            <View>
                                <Text style={styles.switchLabel}>设为当前接单车辆</Text>
                                <Text style={styles.switchSub}>接单大厅将默认显示此车辆</Text>
                            </View>
                            <Switch
                                checked={formData.isDefault}
                                onCheckedChange={(val: boolean) => updateFormField("isDefault", val)}
                            />
                        </View>
                    </Card>

                    {/* 4. 底部警告 */}
                    <View style={styles.warningBox}>
                        <AlertTriangle size={16} color={COLORS.warningIcon} />
                        <Text style={styles.warningMsgText}>
                            修改品牌或车牌后，车辆需重新进行官方认证审核。
                        </Text>
                    </View>

                    {/* 5. 提交按钮 */}
                    <Button
                        style={styles.updateBtn}
                        onPress={onSavePress}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Text style={styles.btnText}>正在提交...</Text>
                        ) : (
                            <View style={styles.btnContent}>
                                <Check size={20} color={COLORS.white} strokeWidth={3} />
                                <Text style={styles.btnText}>确认并保存</Text>
                            </View>
                        )}
                    </Button>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
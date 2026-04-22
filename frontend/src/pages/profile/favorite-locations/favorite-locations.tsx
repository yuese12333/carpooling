/**
 * @file favorite-locations.tsx
 * @description 常用地点管理页面入口。负责业务流 requestId 的初始化与分发，遵循全链路追踪规范。
 */

import React, { useMemo, JSX } from "react";
import { View, Text, StatusBar } from "react-native";
import { ROUTES } from "@/router/paths";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Dialog,
    Portal,
    Button as PaperButton,
    Text as PaperText
} from "react-native-paper";

import { Button } from "@/components/button";
import { Separator } from "@/components/separator";
import { generateRequestId } from '@/utils/logger';
import styles, { COLORS } from "./favorite-locations.style";
import { useFavoriteLocationsForm } from "@/hooks/use-favorite-locations-form";
import { PageHeader } from "./components/page-header";
import { SearchBar } from "./components/search-bar";
import { LocationList } from "./components/location-list";

/**
 * 常用地点管理页面组件
 * @returns {JSX.Element}
 */
export default function FavoriteLocationsPage(): JSX.Element {
    /**
     * 遵循自生成机制：页面级 requestId 必须使用 useMemo 配合 generateRequestId() 独立生成
     * 确保在整个页面生命周期内唯一且稳定，断开与其他业务入口的链路复用
     */
    const requestId = useMemo(() => generateRequestId(), []);

    const {
        searchQuery,
        setSearchQuery,
        locations,
        loading,
        handleAddLocation,
        handleEditLocation,
        handleGetCurrentLocation,
        handleBack,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        activeLocation,
        prepareDelete,
        confirmDelete
    } = useFavoriteLocationsForm(requestId);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 头部组件 */}
            <PageHeader
                title="常用地点"
                onBack={() => handleBack(ROUTES.PROFILE_MAIN)}
            />

            <View style={styles.content}>
                {/* 搜索栏：支持当前位置获取 */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onGetCurrentLocation={handleGetCurrentLocation}
                />

                <Separator style={styles.divider} />

                {/* 地点列表：透传 requestId 以支持子组件潜在的链路追踪需求 */}
                <LocationList
                    data={locations}
                    loading={loading}
                    onEdit={handleEditLocation}
                    onDelete={prepareDelete}
                />
            </View>

            {/* 底部操作区 */}
            <View style={styles.footer}>
                <Button onPress={handleAddLocation} style={styles.mainAddBtn}>
                    <Text style={styles.mainAddBtnText}>新增常用地点</Text>
                </Button>
            </View>

            {/* 删除确认弹窗 */}
            <Portal>
                <Dialog
                    visible={isDeleteDialogOpen}
                    onDismiss={() => setIsDeleteDialogOpen(false)}
                    style={{ borderRadius: 24, backgroundColor: COLORS.white }}
                >
                    <Dialog.Title style={styles.navTitle}>确认删除此地点？</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium">
                            这将永久移除“{activeLocation?.label ?? '未命名地点'}”。此操作不可撤销。
                        </PaperText>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <PaperButton
                            onPress={() => setIsDeleteDialogOpen(false)}
                            labelStyle={{ color: COLORS.textMuted }}
                        >
                            取消
                        </PaperButton>
                        <PaperButton
                            onPress={confirmDelete}
                            mode="text"
                            textColor={COLORS.danger}
                            labelStyle={{ fontWeight: 'bold' }}
                        >
                            确认删除
                        </PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}
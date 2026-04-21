/**
 * @file favorite-locations.tsx
 * @description 常用地点管理页面入口。
 * 遵循生命周期隔离：在此处初始化业务流唯一的 requestId 并向下注入。
 */

import React, { useMemo } from "react";
import { View, Text, StatusBar } from "react-native";
import { ROUTES } from "@/router/paths";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog, Portal, Button as PaperButton, Text as PaperText } from "react-native-paper";
import { Button } from "@/../components/button";
import { Separator } from "@/../components/separator";
import styles, { COLORS } from "./favorite-locations.style";
import { useFavoriteLocationsForm } from "@/hooks/use-favorite-locations-form";
import { PageHeader } from "./components/page-header";
import { SearchBar } from "./components/search-bar";
import { LocationList } from "./components/location-list";

export default function FavoriteLocationsPage() {
    // 模块级同步初始化 RequestId
    const requestId = useMemo(() => `FL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, []);

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

            <PageHeader
                title="常用地点"
                onBack={() => handleBack(ROUTES.PROFILE_MAIN)}
            />

            <View style={styles.content}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onGetCurrentLocation={handleGetCurrentLocation}
                />

                <Separator style={styles.divider} />

                <LocationList
                    data={locations}
                    loading={loading}
                    onEdit={handleEditLocation}
                    onDelete={prepareDelete}
                />
            </View>

            <View style={styles.footer}>
                <Button onPress={handleAddLocation} style={styles.mainAddBtn}>
                    <Text style={styles.mainAddBtnText}>新增常用地点</Text>
                </Button>
            </View>

            <Portal>
                <Dialog
                    visible={isDeleteDialogOpen}
                    onDismiss={() => setIsDeleteDialogOpen(false)}
                    style={{ borderRadius: 24, backgroundColor: COLORS.white }}
                >
                    <Dialog.Title style={styles.navTitle}>确认删除此地点？</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium">
                            这将永久移除“{activeLocation?.label}”。此操作不可撤销。
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
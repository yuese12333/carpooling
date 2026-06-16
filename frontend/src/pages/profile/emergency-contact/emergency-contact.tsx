/**
 * @file emergency-contact.tsx
 * @description 紧急联系人管理页面
 */

import React, { useMemo, useState, useEffect, JSX } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Dialog, Portal, Button as PaperButton, TextInput as PaperTextInput } from "react-native-paper";

import { ROUTES } from "@/router/paths";
import { generateRequestId } from '@/utils/logger';
import { emergencyContactApi, EmergencyContact } from '@/api/emergency-contact-api';
import { COLORS } from "@/pages/style";

const relationOptions = [
    { label: "父亲", value: "父亲" },
    { label: "母亲", value: "母亲" },
    { label: "配偶", value: "配偶" },
    { label: "子女", value: "子女" },
    { label: "朋友", value: "朋友" },
    { label: "其他", value: "其他" },
];

export default function EmergencyContactPage(): JSX.Element {
    const requestId = useMemo(() => generateRequestId(), []);
    const router = useRouter();

    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
    const [formName, setFormName] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formRelation, setFormRelation] = useState("");
    const [formPrimary, setFormPrimary] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        setLoading(true);
        try {
            const result = await emergencyContactApi.getContactList();
            if (result.success && result.data) {
                setContacts(result.data.contacts);
            }
        } catch (error) {
            Alert.alert("提示", "加载联系人列表失败");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingContact(null);
        setFormName("");
        setFormPhone("");
        setFormRelation("");
        setFormPrimary(false);
        setDialogVisible(true);
    };

    const openEditDialog = (contact: EmergencyContact) => {
        setEditingContact(contact);
        setFormName(contact.contactName);
        setFormPhone(contact.contactPhone.replace(/\*/g, "0")); // 显示脱敏前的号码用于编辑
        setFormRelation(contact.relationType || "");
        setFormPrimary(contact.isPrimary);
        setDialogVisible(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) {
            Alert.alert("提示", "请输入联系人姓名");
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(formPhone)) {
            Alert.alert("提示", "请输入正确的手机号");
            return;
        }

        setSubmitting(true);
        try {
            if (editingContact) {
                const result = await emergencyContactApi.updateContact(editingContact.id, {
                    contactName: formName.trim(),
                    contactPhone: formPhone,
                    relationType: formRelation,
                    isPrimary: formPrimary,
                });
                if (result.success) {
                    Alert.alert("成功", "联系人已更新");
                    setDialogVisible(false);
                    loadContacts();
                } else {
                    Alert.alert("提示", result.message || "更新失败");
                }
            } else {
                const result = await emergencyContactApi.addContact({
                    contactName: formName.trim(),
                    contactPhone: formPhone,
                    relationType: formRelation,
                    isPrimary: formPrimary,
                });
                if (result.success) {
                    Alert.alert("成功", "联系人已添加");
                    setDialogVisible(false);
                    loadContacts();
                } else {
                    Alert.alert("提示", result.message || "添加失败");
                }
            }
        } catch (error) {
            Alert.alert("提示", "操作失败，请重试");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (contact: EmergencyContact) => {
        Alert.alert(
            "确认删除",
            `确定要删除联系人"${contact.contactName}"吗？`,
            [
                { text: "取消", style: "cancel" },
                {
                    text: "删除",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await emergencyContactApi.deleteContact(contact.id);
                            if (result.success) {
                                Alert.alert("成功", "联系人已删除");
                                loadContacts();
                            }
                        } catch (error) {
                            Alert.alert("提示", "删除失败");
                        }
                    },
                },
            ]
        );
    };

    const renderContactItem = (contact: EmergencyContact) => (
        <View key={contact.id} style={styles.contactItem}>
            <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{contact.contactName}</Text>
                    {contact.isPrimary && (
                        <View style={styles.primaryBadge}>
                            <Text style={styles.primaryText}>主要</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.contactPhone}>{contact.contactPhone}</Text>
                {contact.relationType && (
                    <Text style={styles.contactRelation}>{contact.relationType}</Text>
                )}
            </View>
            <View style={styles.contactActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditDialog(contact)}
                >
                    <Text style={styles.actionText}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(contact)}
                >
                    <Text style={styles.deleteText}>删除</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" />

            {/* 头部 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>紧急联系人</Text>
                <TouchableOpacity onPress={openAddDialog} style={styles.addBtn}>
                    <Text style={styles.addText}>+ 添加</Text>
                </TouchableOpacity>
            </View>

            {/* 说明 */}
            <View style={styles.notice}>
                <Text style={styles.noticeText}>
                    紧急联系人将在您行程开始时自动收到行程信息通知，最多可添加5位联系人。
                </Text>
            </View>

            {/* 列表 */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : contacts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>暂无紧急联系人</Text>
                    <Text style={styles.emptyHint}>点击右上角"+ 添加"添加联系人</Text>
                </View>
            ) : (
                <ScrollView style={styles.listContainer}>
                    {contacts.map(renderContactItem)}
                </ScrollView>
            )}

            {/* 添加/编辑弹窗 */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>{editingContact ? "编辑联系人" : "添加联系人"}</Dialog.Title>
                    <Dialog.Content>
                        <PaperTextInput
                            label="姓名"
                            value={formName}
                            onChangeText={setFormName}
                            mode="outlined"
                            style={styles.input}
                        />
                        <PaperTextInput
                            label="手机号"
                            value={formPhone}
                            onChangeText={setFormPhone}
                            mode="outlined"
                            keyboardType="phone-pad"
                            maxLength={11}
                            style={styles.input}
                        />
                        <Text style={styles.label}>关系</Text>
                        <View style={styles.relationContainer}>
                            {relationOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.relationTag,
                                        formRelation === opt.value && styles.relationTagActive,
                                    ]}
                                    onPress={() => setFormRelation(opt.value)}
                                >
                                    <Text
                                        style={[
                                            styles.relationText,
                                            formRelation === opt.value && styles.relationTextActive,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.primaryRow}
                            onPress={() => setFormPrimary(!formPrimary)}
                        >
                            <View style={[styles.checkbox, formPrimary && styles.checkboxActive]}>
                                {formPrimary && <Text style={styles.checkMark}>✓</Text>}
                            </View>
                            <Text style={styles.primaryLabel}>设为主要联系人</Text>
                        </TouchableOpacity>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <PaperButton onPress={() => setDialogVisible(false)}>取消</PaperButton>
                        <PaperButton onPress={handleSubmit} loading={submitting}>
                            {editingContact ? "保存" : "添加"}
                        </PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    addBtn: {
        padding: 8,
    },
    addText: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: "500" as const,
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    emptyHint: {
        fontSize: 14,
        color: COLORS.textHint,
        marginTop: 8,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    contactItem: {
        flexDirection: "row" as const,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    contactInfo: {
        flex: 1,
    },
    contactHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
    },
    contactName: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: COLORS.textPrimary,
    },
    primaryBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    primaryText: {
        fontSize: 12,
        color: COLORS.white,
    },
    contactPhone: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    contactRelation: {
        fontSize: 13,
        color: COLORS.textHint,
        marginTop: 2,
    },
    contactActions: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    actionText: {
        fontSize: 14,
        color: COLORS.primary,
    },
    deleteBtn: {
        marginLeft: 4,
    },
    deleteText: {
        fontSize: 14,
        color: COLORS.danger,
    },
    input: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    relationContainer: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        marginBottom: 16,
    },
    relationTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.bgGrey,
        marginRight: 8,
        marginBottom: 8,
    },
    relationTagActive: {
        backgroundColor: COLORS.primary,
    },
    relationText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    relationTextActive: {
        color: COLORS.white,
    },
    primaryRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginRight: 8,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    checkboxActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    checkMark: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "bold" as const,
    },
    primaryLabel: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
};

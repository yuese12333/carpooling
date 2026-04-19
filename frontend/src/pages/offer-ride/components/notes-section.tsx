/**
 * @file notes-section.tsx
 * @description 拼车发布模块的备注说明区块，支持预设标签快捷输入与标准化日志追踪
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { Card } from "@/components/card";
import { Textarea } from "@/components/textarea";
import { Badge } from "@/components/badge";
import styles, { COLORS } from "../offer-ride.style";
import logger from '@/utils/logger';
import { useEnvStore } from '@/store/env-store';

/**
 * 备注区块组件属性定义
 */
interface NotesSectionProps {
    /** 当前备注文本内容 */
    notes: string;
    /** 预设快捷标签列表 */
    tags: { label: string; value: string }[];
    /** 备注内容更新回调 */
    onUpdateNotes: (val: string) => void;
    /** 点击标签快捷追加的回调 */
    onAddTag: (label: string) => void;
}

const MODULE_NAME = 'NOTES_SECTION';

/**
 * 拼车发布页 - 备注与标签区块
 * @param {NotesSectionProps} props
 */
export const NotesSection: React.FC<NotesSectionProps> = ({
    notes,
    tags,
    onUpdateNotes,
    onAddTag
}) => {
    // 全局统一消费 requestId
    const requestId = useEnvStore.getState().currentRequestId;

    /**
     * 处理备注输入变化
     * 遵循隐私保护原则，仅记录行为和长度，不记录具体文本
     */
    const handleNotesChange = (val: string) => {
        onUpdateNotes(val);

        // 仅在文本长度跨越特定阈值或结束输入时记录，避免频繁触发
        if (val.length % 10 === 0) {
            logger.info({
                module: MODULE_NAME,
                operate: 'UPDATE_NOTES_CONTENT',
                requestId,
                params: { length: val.length }, // 严禁泄露用户原始输入内容
                result: 'SUCCESS'
            });
        }
    };

    /**
     * 处理标签点击快捷追加
     * @param {string} label 标签文本内容
     */
    const handleTagPress = (label: string) => {
        logger.info({
            module: MODULE_NAME,
            operate: 'APPEND_PRESET_TAG',
            requestId,
            params: { tagLabel: label },
            result: 'SUCCESS'
        });
        onAddTag(label);
    };

    return (
        <Card className="p-4 mb-6">
            {/* 区块标题 */}
            <View style={styles.noteHeader}>
                <MessageSquare size={16} color={COLORS.textTertiary} style={styles.noteIcon} />
                <Text style={styles.sectionTitleSmall}>备注说明（可选）</Text>
            </View>

            {/* 备注输入框 */}
            <Textarea
                placeholder="例如：车内请勿饮食..."
                value={notes}
                onChangeText={handleNotesChange}
                style={styles.textareaCustom}
            />

            {/* 快捷标签容器 */}
            <View style={styles.tagContainer}>
                {tags.map((tag) => (
                    <TouchableOpacity
                        key={tag.label}
                        onPress={() => handleTagPress(tag.label)}
                        activeOpacity={0.7}
                    >
                        <Badge variant="outline" className="bg-gray-100 border-0">
                            <Text style={styles.tagText}>+ {tag.label}</Text>
                        </Badge>
                    </TouchableOpacity>
                ))}
            </View>
        </Card>
    );
};
/**
 * @file location-item.tsx
 * @description 常用地点列表单项原子组件，负责展示与交互分发
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, Home, Briefcase, MoreVertical, Edit2, Trash2 } from "lucide-react-native";
import { LocationItem as LocationDataType } from "@/api/favorite-locations-api";
import { Card } from "@/../components/card";
import { Badge } from "@/../components/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/../components/popover";
// 修正样式文件引用为 kebab-case
import styles, { COLORS, getCategoryColor } from "../favorite-locations.style";

interface LocationItemProps {
    /** 地点数据对象 */
    item: LocationDataType;
    /** 编辑回调函数 */
    onEdit: (item: LocationDataType) => void;
    /** 删除请求回调函数 */
    onDeleteRequest: (item: LocationDataType) => void;
}

/**
 * 地点列表项原子 UI 组件
 * 遵循原子 UI 层规范：严禁记录业务日志，不感知 requestId
 */
export const LocationItem = ({ item, onEdit, onDeleteRequest }: LocationItemProps) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const Icon = item.type === 'home' ? Home : item.type === 'work' ? Briefcase : MapPin;
    const { main: iconColor, light: bgColor } = getCategoryColor(item.type || 'other');

    /**
     * 处理操作菜单点击
     * @param action - 操作类型
     */
    const handleAction = (action: 'edit' | 'delete') => {
        setIsPopoverOpen(false);

        if (action === 'edit') {
            onEdit(item);
        } else {
            onDeleteRequest(item);
        }
    };

    return (
        <Card style={styles.locationCard}>
            <View style={styles.cardContent}>
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    <Icon size={20} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.locationLabel}>{item.label}</Text>
                        {item.isDefault && (
                            <Badge variant="secondary" style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>默认</Text>
                            </Badge>
                        )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                </View>

                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <TouchableOpacity style={styles.actionBtn}>
                            <MoreVertical size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </PopoverTrigger>
                    <PopoverContent align="end">
                        <TouchableOpacity
                            style={styles.popoverItem}
                            onPress={() => handleAction('edit')}
                        >
                            <Edit2 size={18} color={COLORS.info} />
                            <Text>编辑</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.popoverItem}
                            onPress={() => handleAction('delete')}
                        >
                            <Trash2 size={18} color={COLORS.danger} />
                            <Text style={{ color: COLORS.danger }}>删除</Text>
                        </TouchableOpacity>
                    </PopoverContent>
                </Popover>
            </View>
        </Card>
    );
};
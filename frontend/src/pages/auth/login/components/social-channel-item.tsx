/**
 * @file social-channel-item.tsx
 * @description 登录页面三方社交登录渠道图标组件。
 * 负责展示单一社交平台的图标（Emoji）及标签，并响应点击事件。
 * 遵循规范：文件名采用 kebab-case，函数采用 lowerCamelCase。
 */

import React, { JSX } from 'react';
import {
    Text,
    View,
} from 'react-native';

// 基础组件
import { Button } from '../../../../../components/button';

// 样式引用
import styles from '../login.style';

// 类型定义
import {
    type SocialItemProps
} from '../../../../api/auth';

/**
 * 社交登录渠道项组件
 * @param {SocialItemProps} props - 组件属性
 * @param {string} props.emoji - 渠道展示用的表情符号或图标字符
 * @param {string} props.label - 渠道名称标签（如：微信、QQ）
 * @param {() => void} [props.onPress] - 点击回调函数
 * @returns {JSX.Element} 社交渠道渲染节点
 */
export function SocialChannelItem({
    emoji,
    label,
    onPress
}: SocialItemProps): JSX.Element {
    return (
        <View style={styles.socialItemWrapper}>
            <Button
                variant="outline"
                style={styles.socialIconButton}
                onPress={onPress}
            >
                <Text style={styles.socialEmojiText}>
                    {emoji}
                </Text>
            </Button>
            <Text style={styles.socialIconLabel}>
                {label}
            </Text>
        </View>
    );
}

export default SocialChannelItem;
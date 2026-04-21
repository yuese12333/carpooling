/**
 * @file _layout.tsx
 * @description 根布局配置，负责全局上下文注入、路由管理及弹窗宿主挂载。
 */

import { Stack } from 'expo-router';
import { PortalHost } from "@rn-primitives/portal";
import { View } from 'react-native';
import "../global.css";
import { AuthProvider } from "../store/auth-context";

/**
 * 根布局组件
 * @returns {JSX.Element} 返回包含认证状态和路由容器的根节点
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        {/* 路由容器配置：隐藏原生标题栏 */}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />

        {/* 弹窗宿主：用于渲染 Select, Dialog, Tooltip 等跨层级组件 */}
        <PortalHost name="reusables" />
      </View>
    </AuthProvider>
  );
}
import React, { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useAuth } from '../../../store/auth-context';
import { ROUTES } from '../../../router/paths';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    const isLoginPage = pathname === ROUTES.ADMIN.LOGIN;

    if (!isAuthenticated) {
      if (!isLoginPage) router.replace(ROUTES.ADMIN.LOGIN);
      return;
    }

    if (user?.role !== 'admin') {
      // 无权限页面已移除：直接回普通首页
      router.replace(ROUTES.HOME);
      return;
    }
  }, [isReady, isAuthenticated, user?.role, pathname, router]);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}


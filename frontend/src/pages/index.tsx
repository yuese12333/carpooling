/**
 * @file index.tsx
 * @description 应用入口页面，负责路由重定向分发及链路追踪初始化。
 */

import React from 'react';
import LoginPage from './auth/login/login';
import { useEnvStore } from '../store/env-store';
import logger, { generateRequestId } from '../utils/logger';

/**
 * 在模块加载时同步初始化 RequestId，确保子组件首次渲染时已可读取
 */
(function initTrace() {
  try {
    const requestId = generateRequestId();
    useEnvStore.getState().setCurrentRequestId(requestId);
    logger.info({
      module: 'entry',
      operate: 'page_mount',
      params: { page: 'index' },
      requestId,
      result: 'success'
    });
  } catch (error) {
    logger.error({
      module: 'entry',
      operate: 'trace_init',
      error,
      errorType: 'initialization_error'
    });
  }
})();

export default function Index() {
  return <LoginPage />;
}
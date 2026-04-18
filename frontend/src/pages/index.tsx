/**
 * @file index.tsx
 * @description 应用入口页面，负责路由重定向分发及链路追踪初始化。
 */

import React, { useEffect } from 'react';
import LoginPage from './auth/login/login';
import { useEnvStore } from '../store/env-store';
import logger, { generateRequestId } from '../utils/logger'; // 使用统一工具

/**
 * 入口分发组件
 * @returns {JSX.Element} 返回登录页或引导页
 */
export default function Index() {
  useEffect(() => {
    const initTrace = () => {
      try {
        // 使用项目定义的生成器，确保格式统一
        const requestId = generateRequestId();

        // 存储至全局状态
        useEnvStore.getState().setCurrentRequestId(requestId);

        // 使用 logger 工具打印首条日志，确保链路追踪关联
        logger.info({
          module: 'entry',
          operate: 'page_mount',
          params: { page: 'index' },
          requestId, // 显式传入确保首条记录关联
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
    };

    initTrace();
  }, []);

  return <LoginPage />;
}
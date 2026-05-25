/**
 * @file sync-request-id.ts
 * @description 将页面显式传入的 requestId 同步至 env store，供 request 拦截器注入 X-Request-Id。
 */

import { useEnvStore } from '@/store/env-store';

/**
 * 同步链路追踪 ID 至全局 store
 * @param id 页面级 useMemo 生成并传入的 requestId
 */
export const syncRequestId = (id: string): void => {
    useEnvStore.getState().setCurrentRequestId(id);
};

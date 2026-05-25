/**
 * @file mock-delay.ts
 * @description Mock 请求延迟常量与工具，供 API 层统一模拟网络耗时。
 */

/** Mock 延迟毫秒档位 */
export const MOCK_DELAY_MS = {
    SHORT: 500,
    MEDIUM: 800,
    LONG: 1000,
    CONFIG: 500,
    LOGIN: 1500,
} as const;

/**
 * 模拟异步网络延迟
 * @param ms 延迟毫秒，默认 SHORT
 */
export const mockDelay = (ms: number = MOCK_DELAY_MS.SHORT): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

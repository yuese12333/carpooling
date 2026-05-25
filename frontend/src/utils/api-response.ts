/**
 * @file api-response.ts
 * @description API 响应成功态判断工具，统一 success / code 语义。
 */

import type { ApiResponse } from '@/api/api.d';

/**
 * 判断业务响应是否成功
 */
export const isApiSuccess = (res: ApiResponse): boolean => {
    if (res.success === true) {
        return true;
    }
    if (typeof res.code === 'number') {
        return res.code === 200;
    }
    return false;
};

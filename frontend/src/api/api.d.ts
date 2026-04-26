export interface ApiResponse<T = any> {
    code?: number;    // 状态码，如 200, 401, 500
    data: T;         // 业务数据
    message?: string; // 错误或提示信息
    success?: boolean; // 显式的成功标识（建议保留，方便逻辑判断）
}
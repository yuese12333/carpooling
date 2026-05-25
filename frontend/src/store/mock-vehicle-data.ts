/**
 * @file mock-vehicle-data.ts
 * @description 车辆管理模块 Mock 数据定义文件，用于本地开发环境与 Mock 模式下的数据模拟
 */

import { VehicleInfo } from "@/api/my-vehicles-api";

/**
 * 模拟当前用户的车辆列表数据
 * 遵循 VehicleInfo 接口约束，status 必须为 'verified' | 'pending' | 'rejected'
 */
export const MOCK_VEHICLES: VehicleInfo[] = [
    {
        id: "v1",
        brand: "大众",
        model: "帕萨特 2023款",
        plate: "沪A·88888",
        color: "极地白",
        seats: 5,
        isDefault: true,
        status: "verified", // 已认证车辆
        tags: ["准新车", "禁烟", "新能源"],
        image: "",
    },
    {
        id: "v2",
        brand: "特斯拉",
        model: "Model 3 2024款",
        plate: "沪A·D66666",
        color: "星空灰",
        seats: 5,
        isDefault: false,
        status: "pending", // 审核中状态模拟
        tags: ["自动驾驶", "超长续航"],
        image: "",
    },
    {
        id: "v3",
        brand: "宝马",
        model: "X5",
        plate: "沪A·B1234",
        color: "宝石青",
        seats: 5,
        isDefault: false,
        status: "rejected", // 认证驳回状态模拟
        tags: ["豪华款"],
        image: "",
    }
];
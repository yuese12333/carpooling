/**
 * @file ride-detail-api.ts
 * @description 行程详情 API 请求封装
 */

import request from '@/utils/request';
import logger from '@/utils/logger';
import type { ApiResponse } from '@/api/api.d';
import { useEnvStore } from '@/store/env-store';
import { mockDelay, MOCK_DELAY_MS } from '@/utils/mock-delay';

// --- 类型定义 ---

export interface RideDetailData {
  rideId: string;
  fromText: string;
  toText: string;
  departAt: string;
  seatsLeft: number;
  seatsTotal: number;
  price: number;
  remark?: string;
  status: string;
  driver: {
    userId: string;
    userName: string;
    avatarUrl: string;
    rating: number;
  };
  vehicle?: {
    vehicleId: string;
    model: string;
    color: string;
    plateNumber: string;
  };
}

export interface BookRideParams {
  rideId: string;
  seats: number;
  remark?: string;
  requestId: string;
}

// --- Mock 数据 ---

const MOCK_RIDE_DETAIL: RideDetailData = {
  rideId: 'ride_mock_001',
  fromText: '北京市朝阳区望京SOHO',
  toText: '北京市海淀区中关村软件园',
  departAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  seatsLeft: 3,
  seatsTotal: 4,
  price: 25,
  remark: '准时出发，请提前5分钟到达上车点。',
  status: 'open',
  driver: {
    userId: 'driver_mock_001',
    userName: '张师傅',
    avatarUrl: '',
    rating: 4.9,
  },
  vehicle: {
    vehicleId: 'v_mock_001',
    model: '大众帕萨特',
    color: '黑色',
    plateNumber: '京A****88',
  },
};

// --- API 请求函数 ---

export const rideDetailApi = {
  /**
   * 获取行程详情
   */
  getDetail: async (rideId: string, requestId: string): Promise<ApiResponse<RideDetailData>> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
      await mockDelay(MOCK_DELAY_MS.DETAIL);
      logger.info({
        module: 'ride-detail-api',
        operate: 'getDetail_MOCK',
        params: { rideId },
        result: 'Mock ride detail returned',
        requestId,
      });
      return { success: true, message: 'mock', data: MOCK_RIDE_DETAIL };
    }

    const result = await request.get<any, ApiResponse<RideDetailData>>(`/rides/${rideId}`);

    if (result.success) {
      logger.info({
        module: 'ride-detail-api',
        operate: 'getDetail',
        params: { rideId },
        result: 'Ride detail fetched',
        requestId,
      });
    }

    return result;
  },

  /**
   * 预订行程
   */
  bookRide: async (params: BookRideParams): Promise<ApiResponse<{ orderId: string; tripId: string }>> => {
    const isMockMode = useEnvStore.getState().isMockMode;

    if (isMockMode) {
      await mockDelay(MOCK_DELAY_MS.ACTION);
      logger.info({
        module: 'ride-detail-api',
        operate: 'bookRide_MOCK',
        params: { rideId: params.rideId, seats: params.seats },
        result: 'Mock booking successful',
        requestId: params.requestId,
      });
      return {
        success: true,
        message: 'mock',
        data: {
          orderId: 'order_mock_001',
          tripId: 'trip_mock_001',
        },
      };
    }

    const result = await request.post<any, ApiResponse<{ orderId: string; tripId: string }>>(
      `/rides/${params.rideId}/book`,
      {
        seats: params.seats,
        remark: params.remark,
      }
    );

    if (result.success) {
      logger.info({
        module: 'ride-detail-api',
        operate: 'bookRide',
        params: { rideId: params.rideId, seats: params.seats },
        result: 'Ride booked successfully',
        requestId: params.requestId,
      });
    }

    return result;
  },
};

/**
 * @file mock-data.ts
 * @description 行程模块模拟数据集，包含用户信息、车辆信息及行程记录。
 * @version 1.1.0
 */

/**
 * @description 司机信息接口定义
 */
export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  trips: number;
  verified: boolean;
  car: string;
  carColor: string;
  carPlate: string;
}

/**
 * @description 拼车行程基础信息接口定义
 */
export interface Ride {
  id: string;
  driver: Driver;
  from: string;
  fromDetail: string;
  to: string;
  toDetail: string;
  date: string;
  time: string;
  seats: number;
  seatsLeft: number;
  price: number;
  duration: string;
  distance: string;
  stops: string[];
  notes: string;
  status: "active" | "full" | "completed" | "cancelled";
}

/**
 * @description 用户个人行程关联记录接口定义
 */
export interface MyTrip {
  id: string;
  role: "passenger" | "driver";
  ride: Ride;
  status: "upcoming" | "completed" | "cancelled";
  /** 预订座位数，默认为 1 */
  bookedSeats: number;
}

/**
 * @description 当前登录用户的脱敏基础信息
 */
export const currentUser: Driver = {
  id: "u1",
  name: "李小明",
  avatar: "https://images.unsplash.com/photo-1605504836193-e77d3d9ede8a?q=80&w=400",
  rating: 4.9,
  trips: 47,
  verified: true,
  car: "大众帕萨特",
  carColor: "白色",
  carPlate: "京A·12345",
};

/**
 * @description 系统注册司机列表
 */
const drivers: Driver[] = [
  {
    id: "d1",
    name: "王建国",
    avatar: "https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?q=80&w=400",
    rating: 4.9,
    trips: 128,
    verified: true,
    car: "丰田凯美瑞",
    carColor: "黑色",
    carPlate: "京B·56789",
  },
  {
    id: "d2",
    name: "陈雨晴",
    avatar: "https://images.unsplash.com/photo-1697510364485-e900c2fe7524?q=80&w=400",
    rating: 5.0,
    trips: 63,
    verified: true,
    car: "本田雅阁",
    carColor: "银色",
    carPlate: "京C·88888",
  }
];

/**
 * @description 全局公开拼车资源池
 */
export const mockRides: Ride[] = [
  {
    id: "r1",
    driver: drivers[0],
    from: "望京",
    fromDetail: "望京SOHO T3楼下",
    to: "国贸",
    toDetail: "国贸地铁站C口",
    date: "今天",
    time: "08:30",
    seats: 3,
    seatsLeft: 2,
    price: 18,
    duration: "35分钟",
    distance: "12.5km",
    stops: ["酒仙桥路口", "朝阳公园北门"],
    notes: "准时出发，请提前到达集合点",
    status: "active",
  },
  {
    id: "r2",
    driver: drivers[1],
    from: "回龙观",
    fromDetail: "龙泽地铁站A口",
    to: "中关村",
    toDetail: "中关村软件园2期",
    date: "今天",
    time: "09:00",
    seats: 4,
    seatsLeft: 3,
    price: 25,
    duration: "50分钟",
    distance: "18km",
    stops: ["北清路"],
    notes: "车内禁止饮食",
    status: "active",
  }
];

/**
 * @description 用户个人行程列表数据（包含乘客与司机双重角色）
 */
export const myTrips: MyTrip[] = [
  {
    id: "mt1",
    role: "passenger",
    ride: mockRides[0],
    status: "upcoming",
    bookedSeats: 1,
  },
  {
    id: "mt2",
    role: "driver",
    ride: {
      ...mockRides[1],
      driver: currentUser, // 修正类型断言，直接引用符合 Driver 接口的 currentUser
    },
    status: "upcoming",
    bookedSeats: 0,
  },
  {
    id: "mt3",
    role: "passenger",
    ride: {
      ...mockRides[0],
      id: "r-old-1",
      date: "昨天",
      status: "completed",
    },
    status: "completed",
    bookedSeats: 1,
  }
];
/**
 * 数据库种子数据脚本
 * 运行命令: npx prisma db seed
 * 或: npm run prisma:seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 工具函数：生成唯一 ID
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 工具函数：生成手机号
const generatePhone = (index) => `1380013${String(index).padStart(4, '0')}`;

async function main() {
  console.log('开始填充种子数据...');

  // ============ 1. 清理现有数据（可选，按需取消注释）============
  // console.log('清理现有数据...');
  // await prisma.orderRating.deleteMany();
  // await prisma.carbonTransaction.deleteMany();
  // await prisma.carbonAccount.deleteMany();
  // await prisma.tripLocation.deleteMany();
  // await prisma.safetyAlert.deleteMany();
  // await prisma.orderPayment.deleteMany();
  // await prisma.receipt.deleteMany();
  // await prisma.userViolation.deleteMany();
  // await prisma.tripParticipant.deleteMany();
  // await prisma.rideOrder.deleteMany();
  // await prisma.rideRequest.deleteMany();
  // await prisma.ride.deleteMany();
  // await prisma.vehicle.deleteMany();
  // await prisma.userLocation.deleteMany();
  // await prisma.notificationSetting.deleteMany();
  // await prisma.notification.deleteMany();
  // await prisma.paymentMethod.deleteMany();
  // await prisma.userBadge.deleteMany();
  // await prisma.inviteRecord.deleteMany();
  // await prisma.inviteCode.deleteMany();
  // await prisma.shareEvent.deleteMany();
  // await prisma.searchHistory.deleteMany();
  // await prisma.tripTemplate.deleteMany();
  // await prisma.userPreferenceTag.deleteMany();
  // await prisma.driverCredential.deleteMany();
  // await prisma.emergencyContact.deleteMany();
  // await prisma.realNameAuth.deleteMany();
  // await prisma.userProfile.deleteMany();
  // await prisma.adminAuditLog.deleteMany();
  // await prisma.authUser.deleteMany();
  // console.log('数据清理完成');

  // ============ 2. 创建用户 ============
  console.log('创建用户数据...');
  const passwordHash = await bcrypt.hash('test1234', 10); // 统一密码: test1234

  // 管理员用户
  const adminUser = await prisma.authUser.create({
    data: {
      user_id: generateId('u'),
      phone: '13900000000',
      password_hash: passwordHash,
      user_name: '系统管理员',
      avatar_url: '',
      role: 'admin',
      status: 'active',
    },
  });

  // 创建管理员 Profile
  await prisma.userProfile.create({
    data: {
      user_id: adminUser.user_id,
      role_type: 'passenger',
      real_name: '管理员',
      gender: '男',
      age: 30,
    },
  });

  // 普通用户 - 司机
  const driverUsers = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.authUser.create({
      data: {
        user_id: generateId('u'),
        phone: generatePhone(i + 1),
        password_hash: passwordHash,
        user_name: `司机${i + 1}号`,
        avatar_url: '',
        role: 'user',
        status: 'active',
      },
    });

    await prisma.userProfile.create({
      data: {
        user_id: user.user_id,
        role_type: 'driver',
        real_name: `张司${i + 1}`,
        gender: i % 2 === 0 ? '男' : '女',
        age: 25 + i * 3,
        credit_score: 95 + i,
        rating_avg: 4.5 + (i * 0.1),
        total_completed_orders: 50 + i * 10,
      },
    });

    driverUsers.push(user);
  }

  // 普通用户 - 乘客
  const passengerUsers = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.authUser.create({
      data: {
        user_id: generateId('u'),
        phone: generatePhone(i + 100),
        password_hash: passwordHash,
        user_name: `乘客${i + 1}号`,
        avatar_url: '',
        role: 'user',
        status: 'active',
      },
    });

    await prisma.userProfile.create({
      data: {
        user_id: user.user_id,
        role_type: 'passenger',
        real_name: `李乘${i + 1}`,
        gender: i % 2 === 0 ? '男' : '女',
        age: 20 + i * 2,
        credit_score: 90 + i,
        rating_avg: 4.0 + (i * 0.05),
        total_completed_orders: 10 + i * 5,
      },
    });

    passengerUsers.push(user);
  }

  console.log(`创建了 ${1 + driverUsers.length + passengerUsers.length} 个用户`);

  // ============ 3. 创建车辆 ============
  console.log('创建车辆数据...');
  const vehicles = [];
  const carModels = [
    { brand: '大众', model: '帕萨特', color: '黑色' },
    { brand: '丰田', model: '凯美瑞', color: '白色' },
    { brand: '本田', model: '雅阁', color: '银色' },
    { brand: '宝马', model: '3系', color: '蓝色' },
    { brand: '奔驰', model: 'C级', color: '黑色' },
  ];

  for (let i = 0; i < driverUsers.length; i++) {
    const carInfo = carModels[i % carModels.length];
    const vehicle = await prisma.vehicle.create({
      data: {
        vehicle_id: generateId('v'),
        owner_user_id: driverUsers[i].user_id,
        plate_number: `京A${String(10000 + i).padStart(5, '0')}`,
        brand: carInfo.brand,
        model: carInfo.model,
        color: carInfo.color,
        seat_total: 4,
        is_default: true,
        is_non_smoking: true,
        has_air_conditioner: true,
        vehicle_status: 'active',
        verify_status: 'approved',
      },
    });
    vehicles.push(vehicle);
  }

  // ============ 4. 创建行程 ============
  console.log('创建行程数据...');
  const rides = [];
  const routes = [
    { from: '北京市朝阳区望京SOHO', to: '北京市海淀区中关村软件园', price: 25 },
    { from: '北京市朝阳区国贸CBD', to: '北京市昌平区回龙观', price: 30 },
    { from: '北京市海淀区五道口', to: '北京市通州区万达广场', price: 35 },
    { from: '北京市西城区金融街', to: '北京市大兴区亦庄经济开发区', price: 40 },
    { from: '北京市丰台区丽泽商务区', to: '北京市顺义区后沙峪', price: 45 },
    { from: '北京市东城区王府井', to: '北京市房山区长阳', price: 50 },
    { from: '北京市石景山区万达', to: '北京市门头沟区城区', price: 20 },
    { from: '北京市朝阳区三里屯', to: '北京市海淀区西二旗', price: 28 },
  ];

  for (let i = 0; i < routes.length; i++) {
    const driver = driverUsers[i % driverUsers.length];
    const vehicle = vehicles[i % vehicles.length];
    const route = routes[i];

    // 出发时间：今天开始的未来几天
    const departAt = new Date();
    departAt.setDate(departAt.getDate() + Math.floor(i / 2) + 1);
    departAt.setHours(8 + (i * 2) % 12, 0, 0, 0);

    const ride = await prisma.ride.create({
      data: {
        ride_id: generateId('ride'),
        driver_id: driver.user_id,
        vehicle_id: vehicle.vehicle_id,
        from_text: route.from,
        from_lat: 39.9 + Math.random() * 0.2,
        from_lng: 116.3 + Math.random() * 0.3,
        to_text: route.to,
        to_lat: 39.9 + Math.random() * 0.2,
        to_lng: 116.3 + Math.random() * 0.3,
        depart_at: departAt,
        seats_total: 4,
        seats_left: 4 - (i % 3),
        price: route.price,
        duration_text: '约40分钟',
        distance_text: `${15 + i * 3}公里`,
        notes: `准时出发，请提前5分钟到达上车点。${i % 2 === 0 ? '车内禁烟。' : ''}`,
        ride_status: i < 6 ? 'open' : 'full',
      },
    });
    rides.push(ride);
  }

  // ============ 5. 创建已完成的行程和订单 ============
  console.log('创建历史行程数据...');
  const completedRides = [];
  for (let i = 0; i < 3; i++) {
    const driver = driverUsers[i];
    const vehicle = vehicles[i];

    // 过去的时间
    const departAt = new Date();
    departAt.setDate(departAt.getDate() - (i + 1) * 2);
    departAt.setHours(8, 0, 0, 0);

    const ride = await prisma.ride.create({
      data: {
        ride_id: generateId('ride'),
        driver_id: driver.user_id,
        vehicle_id: vehicle.vehicle_id,
        from_text: routes[i].from,
        to_text: routes[i].to,
        depart_at: departAt,
        seats_total: 4,
        seats_left: 0,
        price: routes[i].price,
        ride_status: 'completed',
      },
    });
    completedRides.push(ride);

    // 创建行程参与者
    await prisma.tripParticipant.create({
      data: {
        trip_id: generateId('trip'),
        ride_id: ride.ride_id,
        user_id: driver.user_id,
        role: 'driver',
        status: 'completed',
        booked_seats: 1,
        joined_at: departAt,
      },
    });

    // 乘客参与
    const passenger = passengerUsers[i];
    await prisma.tripParticipant.create({
      data: {
        trip_id: generateId('trip'),
        ride_id: ride.ride_id,
        user_id: passenger.user_id,
        role: 'passenger',
        status: 'completed',
        booked_seats: 1,
        joined_at: departAt,
        is_rated: true,
      },
    });
  }

  // ============ 6. 创建支付方式 ============
  console.log('创建支付方式数据...');
  for (const user of [...driverUsers, ...passengerUsers]) {
    await prisma.paymentMethod.create({
      data: {
        method_id: generateId('pm'),
        user_id: user.user_id,
        method_type: 'alipay',
        display_name: '支付宝',
        bind_summary: '138****1234',
        is_default: true,
        status: 'active',
      },
    });
  }

  // ============ 7. 创建通知 ============
  console.log('创建通知数据...');
  for (const user of passengerUsers.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        notification_id: generateId('n'),
        user_id: user.user_id,
        category: 'order',
        title: '行程提醒',
        content: '您预订的行程将于明天上午8:00出发，请准时到达上车点。',
        type: 'info',
        is_read: false,
      },
    });

    await prisma.notification.create({
      data: {
        notification_id: generateId('n'),
        user_id: user.user_id,
        category: 'system',
        title: '欢迎使用拼车平台',
        content: '感谢您注册使用我们的拼车服务，祝您出行愉快！',
        type: 'success',
        is_read: true,
      },
    });
  }

  // ============ 8. 创建通知设置 ============
  console.log('创建通知设置...');
  for (const user of [...driverUsers, ...passengerUsers]) {
    await prisma.notificationSetting.create({
      data: {
        user_id: user.user_id,
        push_enabled: true,
        sms_enabled: true,
        email_enabled: false,
        order_notification: true,
        promotion_notification: false,
      },
    });
  }

  // ============ 9. 创建帮助中心数据 ============
  console.log('创建帮助中心数据...');
  const helpCategories = [
    { title: '账号相关', icon: 'user', questions: ['如何修改手机号？', '如何重置密码？', '如何注销账号？'] },
    { title: '行程相关', icon: 'car', questions: ['如何发布行程？', '如何搜索行程？', '如何取消行程？'] },
    { title: '支付相关', icon: 'wallet', questions: ['支持哪些支付方式？', '如何申请退款？', '发票如何开具？'] },
    { title: '安全相关', icon: 'shield', questions: ['行程中遇到问题怎么办？', '如何举报违规行为？'] },
  ];

  for (let i = 0; i < helpCategories.length; i++) {
    const category = await prisma.helpCategory.create({
      data: {
        category_id: generateId('hc'),
        title: helpCategories[i].title,
        icon_name: helpCategories[i].icon,
        sort_order: i,
        status: 'enabled',
      },
    });

    for (let j = 0; j < helpCategories[i].questions.length; j++) {
      await prisma.helpQuestion.create({
        data: {
          question_id: generateId('hq'),
          category_id: category.category_id,
          question: helpCategories[i].questions[j],
          answer: `这是关于"${helpCategories[i].questions[j]}"的详细解答，请参考相关操作指南。如有其他问题，请联系客服。`,
          is_hot: j === 0,
          sort_order: j,
          status: 'enabled',
        },
      });
    }
  }

  // ============ 10. 创建取消原因 ============
  console.log('创建取消原因数据...');
  const cancelReasons = {
    driver: ['临时有事无法出发', '车辆故障', '乘客超时未到达', '其他原因'],
    passenger: ['行程有变', '司机迟迟未到', '车辆与描述不符', '其他原因'],
  };

  for (const [type, reasons] of Object.entries(cancelReasons)) {
    for (let i = 0; i < reasons.length; i++) {
      await prisma.cancelReason.create({
        data: {
          type,
          reason: reasons[i],
          sort_order: i,
          status: 'enabled',
        },
      });
    }
  }

  // ============ 11. 创建协议文档 ============
  console.log('创建协议文档...');
  await prisma.protocol.create({
    data: {
      type: 'user_agreement',
      title: '用户服务协议',
      content: `
# 用户服务协议

欢迎使用拼车平台服务。在使用本平台前，请您仔细阅读以下协议内容。

## 一、服务内容
本平台为用户提供拼车信息发布、搜索、匹配等服务。

## 二、用户注册
1. 用户需使用真实手机号注册
2. 用户应提供真实、准确的信息
3. 用户应对账号安全负责

## 三、用户行为规范
1. 遵守国家法律法规
2. 不发布虚假信息
3. 文明用车，礼貌待人

## 四、免责声明
本平台仅提供信息撮合服务，不对行程中发生的纠纷承担责任。

更新日期：2026年1月1日
      `,
      version: '1.0.0',
      force_update: false,
    },
  });

  await prisma.protocol.create({
    data: {
      type: 'privacy_policy',
      title: '隐私政策',
      content: `
# 隐私政策

我们重视您的隐私保护，本政策说明我们如何收集、使用和保护您的个人信息。

## 一、信息收集
我们收集的信息包括：
- 注册信息（手机号、昵称等）
- 设备信息
- 位置信息（使用服务时）

## 二、信息使用
您的信息将用于：
- 提供拼车服务
- 改进产品体验
- 安全保障

## 三、信息保护
我们采取多种安全措施保护您的个人信息。

## 四、用户权利
您有权查看、更正、删除您的个人信息。

更新日期：2026年1月1日
      `,
      version: '1.0.0',
      force_update: false,
    },
  });

  // ============ 12. 创建系统配置 ============
  console.log('创建系统配置...');
  const configs = [
    { key: 'app_name', value: 'Carpooling', desc: '应用名称' },
    { key: 'max_seats_per_ride', value: '4', desc: '每单最大座位数' },
    { key: 'cancel_fee_rate', value: '0.1', desc: '取消手续费比例' },
    { key: 'min_price', value: '5', desc: '最低行程价格' },
    { key: 'max_price', value: '500', desc: '最高行程价格' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.create({
      data: {
        config_key: config.key,
        config_value: config.value,
        description: config.desc,
      },
    });
  }

  // ============ 13. 创建徽章 ============
  console.log('创建徽章数据...');
  const badges = [
    { code: 'new_user', label: '新手上路', emoji: '🌱' },
    { code: 'veteran', label: '老司机', emoji: '🚗' },
    { code: 'five_star', label: '五星好评', emoji: '⭐' },
    { code: 'safe_driver', label: '安全驾驶', emoji: '🛡️' },
  ];

  for (const user of driverUsers) {
    for (let i = 0; i < badges.length; i++) {
      await prisma.userBadge.create({
        data: {
          user_id: user.user_id,
          badge_code: badges[i].code,
          label: badges[i].label,
          emoji: badges[i].emoji,
          unlocked: i < 2, // 前两个解锁
          unlocked_at: i < 2 ? new Date() : null,
        },
      });
    }
  }

  // ============ 14. 创建邀请码 ============
  console.log('创建邀请码数据...');
  for (const user of [...driverUsers.slice(0, 2), ...passengerUsers.slice(0, 2)]) {
    await prisma.inviteCode.create({
      data: {
        invite_code: `${user.user_name.slice(-2)}${Date.now().toString(36).toUpperCase()}`,
        user_id: user.user_id,
        status: 'active',
      },
    });
  }

  // ============ 15. 创建搜索历史 ============
  console.log('创建搜索历史...');
  for (const user of passengerUsers.slice(0, 3)) {
    await prisma.searchHistory.create({
      data: {
        user_id: user.user_id,
        from_text: '北京市朝阳区望京',
        to_text: '北京市海淀区中关村',
        search_type: 'ride',
      },
    });
  }

  console.log('\n✅ 种子数据填充完成！');
  console.log('\n📊 数据统计:');
  console.log(`   用户: ${1 + driverUsers.length + passengerUsers.length} 个`);
  console.log(`   司机: ${driverUsers.length} 个`);
  console.log(`   乘客: ${passengerUsers.length} 个`);
  console.log(`   车辆: ${vehicles.length} 辆`);
  console.log(`   行程: ${rides.length + completedRides.length} 条`);
  console.log('\n📝 测试账号:');
  console.log('   管理员: 13900000000 / test1234');
  console.log('   司机1: 13800130001 / test1234');
  console.log('   乘客1: 13800130100 / test1234');
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

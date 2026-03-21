
## 第一步：安装到项目

把 `logger.js` 放到项目的 `utils/` 文件夹：

```
carpooling/
├── app/
├── components/
├── utils/
│   └── logger.js   ← 放这里
└── ...
```

---

## 第二步：引入工具

```javascript
import logger, { maskSensitive, generateRequestId } from '../utils/logger';
```

---

## 第三步：掌握两个辅助工具

### `generateRequestId()` — 生成请求ID

```javascript
const rid = generateRequestId();
// 输出：RN202603211430-a3f2k1
// 每次请求开始时生成一次，贯穿整个请求链路
```

### `maskSensitive()` — 敏感数据脱敏

```javascript
const safeParams = maskSensitive({
  phone: '13812341234',   // → 138****1234
  password: '123456',     // → ******
  token: 'abc123',        // → ******
  userId: '1001',         // → 1001（普通字段不变）
});
```

---

## 第四步：记录日志

### 基本格式

```javascript
logger.级别({
  module: '模块名',       // 必填，kebab-case，如 'user-login'
  operate: '操作描述',    // 必填，如 '用户登录'
  params: {},            // 选填，业务参数（先脱敏再传）
  result: '结果',        // INFO/WARN 填这个
  error: '错误信息',     // ERROR/FATAL 填这个
  errorType: '错误类型', // ERROR/FATAL 填这个
  requestId: rid,        // 选填，不传自动生成
});
```

### 五种级别示例

```javascript
// 🔵 DEBUG：开发调试
logger.debug({
  module: 'carpool-match',
  operate: '匹配算法中间值',
  params: { distance: 2.5, candidates: [1001, 1002] },
});

// 🟢 INFO：正常业务流程
logger.info({
  module: 'user-login',
  operate: '用户登录',
  params: maskSensitive({ phone: '13812341234' }),
  result: '登录成功，token生成完成',
  requestId: rid,
});

// 🟡 WARN：非致命异常
logger.warn({
  module: 'carpool-publish',
  operate: '发起拼车',
  params: { userId: 1001 },
  result: '用户位置信息缺失，使用上次缓存位置',
  requestId: rid,
});

// 🔴 ERROR：功能异常
logger.error({
  module: 'order-create',
  operate: '创建订单',
  params: { driverId: 1001, passengerId: 2002 },
  error: '司机当前不可接单',
  errorType: '业务参数异常',
  requestId: rid,
});

// 💀 FATAL：系统崩溃
logger.fatal({
  module: 'app',
  operate: '应用初始化',
  error: '核心配置文件加载失败，应用无法启动',
  errorType: '系统初始化异常',
});
```

---

## 完整页面示例（登录页）

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import logger, { maskSensitive, generateRequestId } from '../utils/logger';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 每次操作生成唯一请求ID
    const rid = generateRequestId();

    logger.info({
      module: 'user-login',
      operate: '用户点击登录',
      params: maskSensitive({ phone }),   // 手机号自动脱敏
      result: '表单验证通过，发起登录请求',
      requestId: rid,
    });

    try {
      const response = await loginAPI(phone, password, rid); // rid 传给后端

      logger.info({
        module: 'user-login',
        operate: '用户登录',
        params: maskSensitive({ phone }),
        result: `登录成功，userId: ${response.userId}`,
        requestId: rid,
      });

    } catch (error) {
      // catch 里必须记 ERROR 日志！
      logger.error({
        module: 'user-login',
        operate: '用户登录',
        params: maskSensitive({ phone }),
        error: error.message,
        errorType: '接口请求异常',
        requestId: rid,
      });

      Alert.alert('登录失败', '请稍后重试');
    }
  };

  return (
    <View>
      <TextInput onChangeText={setPhone} placeholder="手机号" />
      <TextInput onChangeText={setPassword} placeholder="密码" secureTextEntry />
      <Button title="登录" onPress={handleLogin} />
    </View>
  );
}
```

**控制台输出效果：**
```
[INFO] [2026-03-21 14:30:25] [requestId: RN202603211430-a3f2k1] [module: user-login] [device: iOS-16] [operate: 用户点击登录] [params: phone:138****1234] [result: 表单验证通过，发起登录请求]

[INFO] [2026-03-21 14:30:26] [requestId: RN202603211430-a3f2k1] [module: user-login] [device: iOS-16] [operate: 用户登录] [params: phone:138****1234] [result: 登录成功，userId: 1001]
```

---

## 注意事项

**✅ 必须记日志的场景：**
- 所有网络请求发起和结果
- 用户登录/登出/注册
- 拼车发起、匹配、接单、完成等关键节点
- 所有 `catch` 块（必须用 ERROR 级别）
- 支付、订单操作

**❌ 不需要记日志：**
- 每次组件渲染
- 无意义的状态变化
- 用户输入的每一个字符

---

## 快速参考卡

```
logger.debug({ module, operate, params })
logger.info({ module, operate, params, result, requestId })   ← 最常用
logger.warn({ module, operate, params, result, requestId })
logger.error({ module, operate, params, error, errorType, requestId })  ← catch里必用
logger.fatal({ module, operate, error, errorType })

maskSensitive({ phone, password, token })  ← 传params前必须先脱敏
generateRequestId()                        ← 每次请求开始时调用一次
```

---


# 后端 Prisma 开发规范

## 一、生产环境表结构变更流程

**严禁**在生产环境使用 `prisma migrate dev`（该命令仅用于本地开发）。

### 本地开发：新增或修改表

```bash
# 1. 修改 prisma/schema.prisma
# 2. 生成迁移文件并应用到本地数据库
npx prisma migrate dev --name add-rides-table
# migrate dev 会自动执行 prisma generate，手动触发用：
npx prisma generate
```

### 部署到生产服务器

```bash
# 仅执行已有迁移文件，不生成新文件，安全用于生产
npx prisma migrate deploy
```

建议将 `prisma migrate deploy` 加入部署脚本，每次发布前自动执行。

### 查看迁移状态

```bash
npx prisma migrate status
```

---

## 二、后续新增表的开发规范

### 2.1 开发流程

```
1. 在 schema.prisma 中新增 model 定义
2. 执行 npx prisma migrate dev --name <描述>，自动生成迁移文件
3. 在 dao/ 新建对应 dao 文件，使用 prisma.<modelName> 操作
4. 部署时执行 npx prisma migrate deploy
```

### 2.2 schema.prisma 新增表示例（以行程表为例）

```prisma
model Ride {
  ride_id      String     @id @db.VarChar(64)
  driver_id    String     @db.VarChar(64)
  from_city    String     @db.VarChar(100)
  to_city      String     @db.VarChar(100)
  depart_at    DateTime
  seats_total  Int
  seats_left   Int
  price        Decimal    @db.Decimal(10, 2)
  status       RideStatus @default(OPEN)
  created_at   DateTime   @default(now())
  updated_at   DateTime   @updatedAt

  driver       AuthUser   @relation(fields: [driver_id], references: [user_id])

  @@map("rides")
}

enum RideStatus {
  OPEN
  FULL
  CANCELLED
  COMPLETED
}
```

> 新增关联时，`AuthUser` 模型中也需要对应添加反向关联字段（Prisma 强制要求双向声明）：
> ```prisma
> model AuthUser {
>   // ... 现有字段
>   rides  Ride[]  // 新增
> }
> ```

### 2.3 DAO 文件模板

```js
// backend/src/dao/ride-dao.js
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

async function createRide(data, requestId) {
  const ride = await prisma.ride.create({ data });
  logger.info({ module: 'ride-dao', operate: 'create-ride', requestId, params: { rideId: ride.ride_id }, result: 'Ride created' });
  return ride;
}

async function findRideById(rideId, requestId) {
  return prisma.ride.findUnique({
    where: { ride_id: rideId },
    include: { driver: true }, // 关联查询，自动 JOIN
  });
}

async function listOpenRides({ from, to, page = 1, pageSize = 10 }, requestId) {
  return prisma.ride.findMany({
    where: {
      status: 'OPEN',
      from_city: { contains: from },
      to_city: { contains: to },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { depart_at: 'asc' },
  });
}

module.exports = { createRide, findRideById, listOpenRides };
```

### 2.4 需要原生 SQL 时

Prisma 支持直接执行原生 SQL，无需引入 mysql2：

```js
const result = await prisma.$queryRaw`
  SELECT from_city, COUNT(*) AS ride_count
  FROM rides
  WHERE status = 'OPEN'
  GROUP BY from_city
`;
```

---

## 三、常用命令速查

| 命令 | 用途 |
|------|------|
| `npx prisma generate` | 根据 schema 生成 PrismaClient 类型 |
| `npx prisma migrate dev --name <name>` | 本地开发：生成迁移文件并应用 |
| `npx prisma migrate deploy` | 生产部署：执行未应用的迁移 |
| `npx prisma migrate status` | 查看迁移状态 |
| `npx prisma migrate reset` | 重置本地数据库（**仅开发，危险操作**） |
| `npx prisma studio` | 打开可视化数据库管理界面 |
| `npx prisma db pull` | 从现有数据库反向生成 schema（用于对齐） |

---

## 四、注意事项

| 事项 | 说明 |
|------|------|
| **密码加密位置** | Prisma 无 Hook 机制，密码加密在 `auth-service.js` 的 service 层完成（现有逻辑不需要改） |
| **主键类型** | 现有 `auth_users` 用 `String @id`，新表保持一致，不用 `Int @default(autoincrement())` |
| **生产迁移命令** | 只用 `migrate deploy`，禁止在生产环境用 `migrate dev` 或 `migrate reset` |
| **schema 提交 Git** | `prisma/schema.prisma` 和 `prisma/migrations/` 必须提交，这是表结构的唯一文档 |
| **DATABASE_URL 不提交** | `.env` 已在 `.gitignore` 中，`DATABASE_URL` 包含密码，严禁提交 |
| **PrismaClient 单例** | 开发环境热重载会反复 require，必须用 `global.__prisma` 保证单例，避免连接数暴增 |

# 后端 Prisma 开发规范

> **表结构唯一真相**：`backend/prisma/schema.prisma` + `backend/prisma/migrations/`  
> 所有 MySQL 表的创建、变更、索引、外键，**只能**通过 Prisma Migrate 完成。

---

## 零、核心原则（必须遵守）

### 0.1 什么算「建表」

以下行为一律视为**建表/改表**，只能走 Prisma：

| 允许 | 禁止 |
|------|------|
| 修改 `schema.prisma` 后执行 `prisma migrate dev` / `migrate deploy` | 在业务代码、`dao`、脚本里写 `CREATE TABLE` / `ALTER TABLE` |
| 提交 `prisma/migrations/<timestamp>_<name>/migration.sql` | 在 Navicat / 运维面板手工改表且不补 migration |
| 生产部署前执行 `npm run prisma:migrate:deploy` | 调用 `schema-dao` 或类似工具在运行时建表 |
| 用 `prisma db pull` **仅作**对齐参考，再人工整理进 `schema.prisma` | 以 `db pull` 结果直接覆盖 Git 中的 schema，不经过 review |

### 0.2 目录职责

```
backend/prisma/
├── schema.prisma      # 全库 model 定义（唯一维护入口）
└── migrations/        # 每次变更的版本化 SQL（必须提交 Git）
```

- **DAO / Service**：只做 `prisma.<model>` 或受控的 `$queryRaw`，**不**承担 DDL。
- **`POST /api/users/init-schema`**：仅做 **Prisma 连通性检查**（`SELECT 1`），**不会**执行任何 `CREATE TABLE`。建表请在部署流程中执行 `prisma migrate deploy`。

### 0.3 与历史 `schema-dao.js` 的关系

仓库中若仍存在 `backend/src/dao/schema-dao.js`（内含大量 `CREATE TABLE IF NOT EXISTS`）：

- 视为**已废弃**，不得在新功能中引用。
- 不得在生产环境执行其 `ensureCoreSchema` / `apply` 逻辑。
- 其中表结构需**逐步迁入** `schema.prisma`（见 [第三节](#三历史表与-schema-dao-治理)），迁移完成前相关接口可继续 Mock 或只读旧表。

### 0.4 新增业务模块的标准路径

```
需求/接口设计 → 在 schema.prisma 设计 model → migrate dev 生成迁移
→ 新建 xxx-dao.js（prisma 访问）→ service → controller → 联调文档
```

**禁止**：先手写 SQL 建表再补 Prisma，或前后端并行时 schema 长期只在本地、不提交 migrations。

---

## 一、生产环境表结构变更流程

**严禁**在生产环境使用 `prisma migrate dev`（该命令仅用于本地开发）。

### 本地开发：新增或修改表

```bash
cd backend

# 1. 修改 prisma/schema.prisma
# 2. 生成迁移文件并应用到本地数据库
npx prisma migrate dev --name add-rides-table

# migrate dev 会自动 prisma generate；也可手动：
npx prisma generate
```

### 部署到生产 / 测试服务器

```bash
cd backend

# 仅执行已有迁移文件，不生成新文件
npm run prisma:migrate:deploy

# 发布前建议确认无未应用迁移
npm run prisma:migrate:status
```

建议将 `prisma migrate deploy` 写入部署脚本（见 `docs/backend/打包与上传服务器流程.md`），**每次发布 backend 前自动执行**。

### 查看迁移状态

```bash
npx prisma migrate status
```

---

## 二、后续新增表的开发规范

### 2.1 开发流程

```
1. 在 schema.prisma 中新增 model（及 enum、关联）
2. npx prisma migrate dev --name <英文短描述>
3. 在 dao/ 新建对应文件，使用 prisma.<model>
4. service / controller 联调
5. 将迁移目录与 schema.prisma 一并提交 PR
6. 部署环境执行 prisma migrate deploy
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

> 新增关联时，`AuthUser` 须添加反向字段（Prisma 要求双向声明）：
>
> ```prisma
> model AuthUser {
>   // ... 现有字段
>   rides  Ride[]
> }
> ```

### 2.3 命名约定（与现有库一致）

| 项 | 约定 |
|----|------|
| Prisma model | PascalCase，如 `AuthUser`、`RideOrder` |
| 数据库表名 | snake_case，用 `@@map("auth_users")` |
| 主键 | 业务主键用 `String @id @db.VarChar(64)`，与 `auth_users.user_id` 一致 |
| 时间字段 | `created_at` / `updated_at`，`@default(now())` + `@updatedAt` |
| 金额 | `Decimal @db.Decimal(10, 2)` |

### 2.4 DAO 文件模板

```js
// backend/src/dao/ride-dao.js
const prisma = require('../config/prisma');
const { logger } = require('../utils/logger');

async function createRide(data, requestId) {
  const ride = await prisma.ride.create({ data });
  logger.info({
    module: 'ride-dao',
    operate: 'create-ride',
    requestId,
    params: { rideId: ride.ride_id },
    result: 'Ride created',
  });
  return ride;
}

async function findRideById(rideId, requestId) {
  return prisma.ride.findUnique({
    where: { ride_id: rideId },
    include: { driver: true },
  });
}

module.exports { createRide, findRideById };
```

### 2.5 需要原生 SQL 时

仅用于**查询/统计**等 Prisma 不便表达的场景；**禁止**在 `$executeRaw` 中写 DDL。

```js
const result = await prisma.$queryRaw`
  SELECT from_city, COUNT(*) AS ride_count
  FROM rides
  WHERE status = 'OPEN'
  GROUP BY from_city
`;
```

---

## 三、历史表与 schema-dao 治理

若数据库或旧分支中已通过 `schema-dao` / 手工 SQL 存在 `vehicles`、`ride_orders` 等表，而 `schema.prisma` 中尚无对应 model，按以下顺序治理：

### 3.1 盘点

```bash
# 本地连接目标库后
npx prisma db pull --print > /tmp/current-db.prisma
```

对照 `schema-dao.js` 中的表清单与 `/tmp/current-db.prisma`，列出：

- 需要保留并纳入 Prisma 的表
- 从未使用、可废弃的表（需团队确认后再删 migration）

### 3.2 纳入 Prisma（推荐：baseline 已有表）

**场景**：MySQL 里**已经有**表和数据，Prisma migrations 要从当前状态开始接管。

1. 将表结构整理进 `schema.prisma`（字段类型、索引、`@@map` 与线上一致）。
2. 生成迁移目录但不改库（baseline）：

```bash
mkdir -p prisma/migrations/0_baseline_existing

# 将「当前线上一致」的 DDL 写入 migration.sql（仅作记录）
# 或从 db pull 结果手工整理

npx prisma migrate resolve --applied 0_baseline_existing
```

3. 之后所有变更仍用 `migrate dev` → `migrate deploy`。

> 具体 baseline 命令因环境而异；若 `auth_users` 已由 `20260426044604_create_auth_users` 等迁移管理，**不要**对同一表重复 baseline，只处理 Prisma 尚未记录的表。

### 3.3 纳入 Prisma（新环境：空库）

空库或本地全新库：

```bash
npx prisma migrate deploy
```

即可按 `migrations/` 顺序建齐当前 Prisma 管理的全部表。

### 3.4 废弃 schema-dao

治理完成后：

1. 确认无任何 `require('../dao/schema-dao')` 引用。
2. 删除或归档 `schema-dao.js`（建议单独 PR，避免与业务混杂）。
3. 更新 `backend/README.md` 中关于 `init-schema` 的说明，明确仅连通性检查。

---

## 四、首次接入已有 `auth_users` 库（baseline 简述）

适用于：库中**已有** `auth_users`（可能无 `role`/`status`），需纳入 Prisma 迁移历史。

1. 备份数据库。
2. 确保 `schema.prisma` 中 `AuthUser` 与目标结构一致。
3. 若表已存在且与某一版 migration 一致，对该 migration 执行：

```bash
npx prisma migrate resolve --applied <migration_folder_name>
```

4. 若缺字段（如 `role`、`status`），应存在对应 migration（如 `20260429000000_add_admin_role_status_and_audit_logs`），在测试库执行：

```bash
npx prisma migrate deploy
```

5. 验证：

```bash
npx prisma migrate status
npm run prisma:generate
```

---

## 五、环境与部署检查清单

| 步骤 | 命令 / 动作 |
|------|-------------|
| 配置连接串 | `backend/.env` 中 `DATABASE_URL`（密码含 `@` 须 URL 编码为 `%40`） |
| 创建空库 | `CREATE DATABASE carpooling ... utf8mb4` |
| 应用迁移 | `npm run prisma:migrate:deploy` |
| 生成 Client | `npm run prisma:generate`（deploy 后或 CI 中执行） |
| 探活 | `GET /health` → `db_connected: true` |
| 禁止 | 应用启动时自动 `CREATE TABLE` |

---

## 六、常用命令速查

| 命令 | 用途 |
|------|------|
| `npx prisma generate` | 根据 schema 生成 Prisma Client |
| `npx prisma migrate dev --name <name>` | **仅本地**：生成迁移并应用 |
| `npx prisma migrate deploy` | **生产/测试**：执行未应用的迁移 |
| `npx prisma migrate status` | 查看迁移是否已应用 |
| `npx prisma migrate resolve --applied <dir>` | 将已有库标记为「已应用某迁移」 |
| `npx prisma migrate reset` | 清空并重建本地库（**仅开发，危险**） |
| `npx prisma studio` | 可视化查看/编辑数据 |
| `npx prisma db pull` | 从现有库反推 schema（对齐用，须人工合并进 Git） |

---

## 七、注意事项

| 事项 | 说明 |
|------|------|
| **唯一建表入口** | 仅 `schema.prisma` + `migrations/` |
| **密码加密** | 在 `auth-service.js` 等业务层完成，不依赖 Prisma Hook |
| **生产迁移** | 只用 `migrate deploy`，禁止 `migrate dev` / `migrate reset` |
| **提交 Git** | `schema.prisma` 与 `prisma/migrations/**` 必须入库 |
| **DATABASE_URL** | 禁止提交 `.env` |
| **PrismaClient 单例** | 使用 `global.__prisma`，避免热重载连接泄漏 |
| **接口与表对齐** | 新接口先在 `docs/api/接口汇总清单.md` 登记，再补 model |
| **跨分支合并** | 两人同时改 schema 时，后合并者须 `migrate dev` 解决冲突并保留双方 migration 顺序 |

---

## 八、当前 Prisma 已管理的表（随迁移演进，以 schema 为准）

以 `backend/prisma/schema.prisma` 为准；撰写时仓库内示例：

| 表名 | 用途 |
|------|------|
| `auth_users` | 注册、登录、管理员角色与状态 |
| `admin_audit_logs` | 管理后台操作审计 |

阶段四（首页、行程、车辆、地点、支付、通知等）须在 **本规范流程下** 逐模块补充 model，不得再使用 `schema-dao` 或运行时 DDL。

---

## 九、相关文档

- [接口汇总清单](../api/接口汇总清单.md) — 接口与实现状态  
- [打包与上传服务器流程](./打包与上传服务器流程.md) — 部署时执行 migrate deploy  
- [backend/README.md](../../backend/README.md) — 环境变量与启动说明

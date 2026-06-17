# 项目文档（docs）

本目录按主题分子文件夹存放说明文档。新增文档时请放入对应分类，并在下表补充索引。

**阅读建议**：联调看 `api/`；上手运行看根目录与各子项目 README；测试结论看 `tests/TEST_REPORT.md`。

---

## project — 项目管理

| 文档 | 说明 |
|------|------|
| [**项目计划书.md**](./project/项目计划书.md) | 项目目标、团队分工、技术方案、进度与验收 |
| [**软件需求规格说明书.md**](./project/软件需求规格说明书.md) | 功能需求、非功能需求、用户角色与业务规则 |

---

## design — 设计文档

| 文档 | 说明 |
|------|------|
| [**系统架构设计.md**](./design/系统架构设计.md) | 技术选型、架构分层、模块设计、数据与接口架构 |

---

## api — 接口与联调

| 文档 | 说明 |
|------|------|
| [**接口汇总清单.md**](./api/接口汇总清单.md) | 前后端 API 汇总、路径约定与联调状态（**接口主参考**） |
| [登录接口联调文档.md](./api/登录接口联调文档.md) | 登录配置 + 密码登录 |
| [用户注册接口联调文档.md](./api/用户注册接口联调文档.md) | 注册全流程（昵称 → 短信 → register） |
| [短信验证接口联调文档.md](./api/短信验证接口联调文档.md) | `POST /api/sms/send`、`POST /api/sms/verify` |
| [文件上传接口联调文档.md](./api/文件上传接口联调文档.md) | `POST /api/upload` |

---

## backend — 后端开发

| 文档 | 说明 |
|------|------|
| [Prisma开发规范.md](./backend/Prisma开发规范.md) | Prisma 迁移、schema 变更与 dao 开发流程 |
| [**数据库设计文档.md**](./backend/数据库设计文档.md) | 39 张表的字段、关系、索引与业务注意事项 |
| [打包与上传服务器流程.md](./backend/打包与上传服务器流程.md) | 构建 `dist/` 与发布到测试/生产服务器 |

---

## frontend — 前端 / Android

| 文档 | 说明 |
|------|------|
| [**高德地图Android_SDK接入与开发说明.md**](./frontend/高德地图Android_SDK接入与开发说明.md) | 高德 2D 地图 + 定位 + 搜索（**地图相关唯一入口**） |
| [安卓原生工程与版本控制说明.md](./frontend/安卓原生工程与版本控制说明.md) | `frontend/android` 与 Git 协作 |

### Mock 模式

登录页右上角开关控制：

- **开启**（`isMockMode=true`）：本地模拟数据，无需后端
- **关闭**：调用 `EXPO_PUBLIC_API_URL` 对应的真实 API

所有 API 文件统一使用 `useEnvStore.getState().isMockMode` 判断，禁止用 `NODE_ENV` 代替。

---

## tests — 测试

| 文档 | 说明 |
|------|------|
| [**全量测试文档.md**](./tests/全量测试文档.md) | 测试策略、用例设计、验收标准（**测试规范主参考**） |
| [**TEST_REPORT.md**](./tests/TEST_REPORT.md) | 最近一次前后端自动化测试结果与覆盖率快照 |

---

## system — 系统设计

| 文档 | 说明 |
|------|------|
| [**管理员系统设计文档.md**](./system/管理员系统设计文档.md) | 管理后台：权限、接口、实现状态与验收 |

---

## user — 用户文档

| 文档 | 说明 |
|------|------|
| [**用户手册.md**](./user/用户手册.md) | 应用安装、功能使用、常见问题（面向最终用户） |

---

## ops — 协作与规范

| 文档 | 说明 |
|------|------|
| [日志规范与埋点说明.md](./ops/日志规范与埋点说明.md) | 统一日志格式、`requestId` 链路追踪 |
| [分支管理与提交流程.md](./ops/分支管理与提交流程.md) | 分支策略、PR 与日常提交（配合根目录 `CONTRIBUTING.md`） |

---

## 其他入口

| 文件 | 说明 |
|------|------|
| [../README.md](../README.md) | 仓库总览、快速启动、功能与测试入口 |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | 命名、目录、Commit、接口方法等协作规范 |
| [../frontend/README.md](../frontend/README.md) | Expo 运行、环境变量、项目结构 |
| [../backend/README.md](../backend/README.md) | 后端启动、模块索引、部署要点 |
| [../CLAUDE.md](../CLAUDE.md) | AI 辅助开发约束速查 |

---

## 文档分类一览

```
docs/
├── project/      # 需求、计划
├── design/       # 架构设计
├── api/          # 接口清单与联调
├── backend/      # 数据库、Prisma、部署
├── frontend/     # RN / Android 原生
├── tests/        # 测试规范与报告
├── system/       # 子系统设计（如管理后台）
├── user/         # 用户手册
└── ops/          # 协作流程、日志
```

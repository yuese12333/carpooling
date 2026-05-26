# 项目文档（docs）

本目录按主题分子文件夹存放说明文档。新增文档时请放入对应分类，并在下表补充索引。

---

## api — 接口与联调

| 文档 | 说明 |
|------|------|
| [**接口汇总清单.md**](./api/接口汇总清单.md) | 前后端 API 汇总、路径约定与联调状态（**接口主参考**） |
| [登录接口联调文档.md](./api/登录接口联调文档.md) | 阶段一：登录配置 + 密码登录 |
| [用户注册接口联调文档.md](./api/用户注册接口联调文档.md) | 注册全流程（昵称校验 → 短信 → register） |
| [短信验证接口联调文档.md](./api/短信验证接口联调文档.md) | `POST /api/sms/send`、`POST /api/sms/verify` |
| [文件上传接口联调文档.md](./api/文件上传接口联调文档.md) | `POST /api/upload` |

---

## backend — 后端开发

| 文档 | 说明 |
|------|------|
| [Prisma开发规范.md](./backend/Prisma开发规范.md) | Prisma 迁移、schema 变更与 dao 开发流程 |
| [打包与上传服务器流程.md](./backend/打包与上传服务器流程.md) | 构建与发布到测试/生产服务器 |

---

## frontend — 前端 / Android

| 文档 | 说明 |
|------|------|
| [**高德地图Android_SDK接入与开发说明.md**](./frontend/高德地图Android_SDK接入与开发说明.md) | 高德 2D 地图 + 定位 + 搜索（**地图相关唯一入口**） |
| [安卓原生工程与版本控制说明.md](./frontend/安卓原生工程与版本控制说明.md) | `frontend/android` 与 Git 协作 |

---

## system — 系统设计

| 文档 | 说明 |
|------|------|
| [**管理员系统设计文档.md**](./system/管理员系统设计文档.md) | 管理后台：权限、接口、实现状态与验收 |

> 后续可在此分类新增：行程系统设计、支付系统设计等。

---

## ops — 协作与规范

| 文档 | 说明 |
|------|------|
| [日志规范与埋点说明.md](./ops/日志规范与埋点说明.md) | 统一日志格式、`requestId` 链路追踪 |
| [分支管理与提交流程.md](./ops/分支管理与提交流程.md) | 分支策略、合并与日常提交（配合根目录 `CONTRIBUTING.md`） |

---

## 其他入口

- 仓库根目录 [**CONTRIBUTING.md**](../CONTRIBUTING.md)：命名、目录、Commit 规范等。  
- [**frontend/README.md**](../frontend/README.md)：Expo 运行与环境变量。  
- [**backend/README.md**](../backend/README.md)：后端启动、已实现接口速查。

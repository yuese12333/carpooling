# 小组协作说明

本文档说明如何参与开发、推送前检查以及推荐的分支与协作方式。

---

## 推送前必做检查（推送到 GitHub main 前）

在首次或日常推送到 GitHub 的 `main` 分支前，请确认以下事项。

### 1. 仓库结构统一

- 仓库根目录应为 **carpooling**（包含 `frontend/`、`backend/`、根目录 `README.md`），而不是仅包含前端或后端。
- 若当前只有 `frontend` 目录下有 `.git`，需要改为在**根目录**初始化 Git，使整个项目（frontend + backend）作为一个仓库推送。具体步骤见下方「首次推送到 GitHub」。

### 2. 敏感信息不提交

- 不要提交 `.env` 文件（前后端均已加入 `.gitignore`）。
- 不要将 API 密钥、数据库连接串、服务器 IP/密码等写进代码或提交到仓库。
- 可提交 `.env.example` 作为模板（仅包含变量名与示例值，无真实密钥）。

### 3. 依赖与锁文件

- 建议提交 `package-lock.json`（以及后端的 `package-lock.json`），便于团队安装到一致依赖版本。
- 提交前在 `frontend` 和 `backend` 各执行一次 `npm install`，确认无报错且锁文件已更新（若有改动）。

### 4. 文档与约定

- 根目录、`frontend/`、`backend/` 的 README 保持可读，新成员能按文档跑起前后端。
- 后端接口约定：**仅使用 POST**，请求体 JSON；前端调用时使用 `API_BASE_URL`（见 frontend 的 `constants/api.ts`）。

### 5. 代码与格式

- 提交前在 `frontend` 下执行 `npm run lint`（若有），修复必须修复的报错。
- 尽量保持提交信息清晰（如「feat: 登录接口」「fix: 首页列表报错」）。

---

## 首次推送到 GitHub（main 分支）

若尚未在根目录初始化 Git，按以下步骤操作（在项目根目录 `E:\carpooling` 执行）：

```bash
# 1. 删除或移走 frontend 下的 .git，使整个项目统一由根目录管理
# Windows PowerShell（在项目根目录执行）：
Remove-Item -Recurse -Force frontend\.git

# 2. 在根目录初始化 Git
git init

# 3. 设置默认分支为 main
git branch -M main

# 4. 添加所有文件（.gitignore 会排除 node_modules、.env 等）
git add .

# 5. 检查将要提交的内容，确认无敏感文件
git status

# 6. 首次提交
git commit -m "chore: initial commit (frontend + backend)"

# 7. 在 GitHub 上新建仓库后，添加远程并推送
git remote add origin https://github.com/你的用户名/carpooling.git
git push -u origin main
```

若 GitHub 仓库已存在且为空，可直接执行第 7 步；若已有内容，按需先 `git pull origin main --rebase` 再推送。

---

## 推荐的小组协作方式

- **主分支**：`main` 保持可运行、可部署，只合并已通过 review 或约定流程的代码。
- **开发分支**：每人或每功能从 `main` 拉取新分支（如 `feature/login`、`fix/list-error`），开发完成后通过 **Pull Request** 合并回 `main`。
- **环境**：开发用内网后端、测试用公网后端；前端通过 `.env` 中 `EXPO_PUBLIC_API_URL` 切换（见 frontend/README）。
- **沟通**：用 GitHub Issues 跟踪任务、Bug，用 PR 做代码评审与讨论。

---

## 新成员拉取项目后

```bash
git clone https://github.com/你的用户名/carpooling.git
cd carpooling

# 前端
cd frontend && cp .env.example .env && npm install
# 按需修改 .env 中的 EXPO_PUBLIC_API_URL（开发用内网地址）

# 后端
cd ../backend && npm install
```

前端运行：`cd frontend && npx expo start`  
后端运行：`cd backend && npm start` 或 `npm run dev`

详细环境要求见各子目录下的 README。

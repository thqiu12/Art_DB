# 升学条件筛选数据库

社内工具,用于「日高生 + 海外高中非留学签证」的报考条件筛选与管理。  
覆盖原 Excel(主表 / 学校 list / 学生条件)的全部数据,补充登录 + 双权限。

- **登录**: 自定账号密码 (bcrypt)
- **权限**: 编辑者 / 查看者
- **筛选**: 输入学生条件,实时计算 ⭕可报考 / 🟡需人工确认 / 🔴不可报考
- **编辑**: 招生项目 / 学校 / 用户 三个管理页面
- **部署**: Vercel + Postgres (Neon / Vercel Postgres)

## 技术栈

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma 6 + Postgres
- NextAuth v5 (Credentials Provider)

## 本地启动

### 1) 准备数据库

最简单的方式: 注册 [Neon](https://neon.tech) 免费账户,新建一个 Postgres 数据库,
拷贝 **Pooled** 与 **Direct** 两个连接串。

或者本地用 Docker:

```bash
docker run -d --name uni-pg \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
# 连接串: postgresql://postgres:postgres@localhost:5432/postgres
```

### 2) 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```
DATABASE_URL="..."        # Neon Pooled URL 或本地连接串
DIRECT_URL="..."          # Neon Direct URL (Migrate 用)。本地可与 DATABASE_URL 一致
AUTH_SECRET="..."         # 用 `openssl rand -base64 32` 生成
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="改成强密码"
IMPORT_XLSX_PATH="/Users/.../7. 🏋️日高生＋海外高中非留学签证报考条件筛选表.xlsx"
```

### 3) 初始化

```bash
npm install
npm run db:push        # 建表
npm run db:seed        # 创建管理员
npm run import:excel   # 把原 Excel 数据全部导入
```

### 4) 启动

```bash
npm run dev
# http://localhost:3000
```

使用 `.env.local` 中的 `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` 登录。
**登录后请立即在「用户」页面修改默认密码,或新建专属账号后删除 admin。**

## 部署到 Vercel

1. 把项目推到 GitHub (`git init && git add . && git commit -m "init" && git push`)。
2. 在 [Vercel](https://vercel.com/new) 导入仓库,框架自动识别为 Next.js。
3. 在 Vercel 项目 → **Storage** 中创建一个 **Postgres**(选 Neon),
   它会自动写入 `DATABASE_URL`、`DIRECT_URL` 等变量。
4. 在 **Settings → Environment Variables** 中再补:
   - `AUTH_SECRET`: `openssl rand -base64 32` 生成
   - `AUTH_URL`: `https://your-app.vercel.app` (Vercel 域名)
   - `SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD` (仅初始化用)
5. 第一次部署后,把生产的 `DATABASE_URL` 临时拷到本地 `.env.local`,然后:
   ```bash
   npm run db:push        # 在生产 DB 建表
   npm run db:seed        # 创建管理员
   npm run import:excel   # 导入 Excel
   ```
   之后再把 `.env.local` 改回本地。

后续要修改数据,直接在网页上操作即可。

## 数据模型

- **User**: `username`, `passwordHash`, `displayName`, `role (EDITOR | VIEWER)`
- **School**: `name`, `active` (停用的学校在筛选页默认隐藏)
- **Program**: 主表的一行 (学校 × 选拔方式),包含日程类型、各种可否、日语要求等

筛选页 (`/dashboard`) 根据 [src/lib/eligibility.ts](src/lib/eligibility.ts) 中的
逻辑实时计算判定结果,等价于原 Excel 中 L–P 列的公式。

## 注意事项

- 复杂日语要求 (JPT / J.TEST / BJT 等) 暂归为「需人工确认」,在 UI 中以黄色显示。
- 删除学校会连带删除其全部招生项目。
- 不能删除当前登录的账号。
- 出席率 = 0 视作「无要求」。

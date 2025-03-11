# 华为中兴配置工具

这是一个用于生成华为和中兴网络设备配置命令的工具，支持 Supabase 数据库集成和 Clerk 身份认证，可以保存、加载配置数据，并提供基于角色的访问控制。

## 功能特点

- 支持华为和中兴设备的多种配置类型
  - 华为: 下发、手工、ONU、组播
  - 中兴: C300、C600手工、C600下发
- 生成标准化的配置命令
- 数据持久化存储至 Supabase
- 用户认证与授权 (通过 Clerk)
- 基于角色的访问控制系统
- 可导出配置为 CSV 格式
- 支持多种配置类型和制作原因
- 框号/槽位/PON口统一管理

## 用户权限系统

本项目集成了基于角色的用户权限系统:

- **普通用户**: 可以查看和加载配置数据，但不能删除数据
- **管理员用户**: 拥有所有权限，包括删除数据的权限

管理员角色通过 Clerk 的用户元数据 (User Metadata) 进行设置和管理。

## 数据库集成

本项目已集成 Supabase 作为后端数据库，提供以下功能:
- 保存配置到云端数据库
- 查看历史配置记录
- 加载已保存的配置
- 删除不需要的配置 (需要管理员权限)
- 按制作原因分类管理配置

## 认证系统

本项目使用 Clerk 提供身份认证和用户管理功能：
- 用户注册与登录
- 基于角色的权限管理
- 安全访问控制
- 用户会话管理

## 安装与运行

确保你已安装了 Node.js (16.x 或更高版本)。

1. 克隆仓库并安装依赖:

```bash
git clone <repository-url>
cd my-app
npm install
```

2. 在 Supabase 中创建数据库表:

- 登录 Supabase 控制台 (https://supabase.com)
- 转到 SQL 编辑器
- 复制并执行 `supabase.sql` 文件中的 SQL 语句

3. 创建 Clerk 应用并获取 API 密钥:

- 登录 Clerk 控制台 (https://dashboard.clerk.dev/)
- 创建新应用
- 从设置页面获取API密钥

4. 配置环境变量:

创建或更新 `.env.local` 文件，添加 Supabase 和 Clerk 连接信息:

```
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

5. 运行开发服务器:

```bash
npm run dev
```

6. 打开浏览器，访问 http://localhost:3000

## 设置管理员用户

要设置管理员用户，请按照以下步骤操作:

1. 访问 [Clerk Dashboard](https://dashboard.clerk.dev/)
2. 登录您的 Clerk 账号
3. 选择您的应用
4. 在左侧导航栏点击 "Users"
5. 找到并点击您想设为管理员的用户
6. 在用户详情页面，找到 "Public metadata" 部分
7. 点击 "Edit" 按钮
8. 输入以下 JSON 数据：
   ```json
   {
     "role": "admin"
   }
   ```
9. 点击 "Save" 按钮保存更改

## 使用说明

1. 注册并登录您的账户
2. 从侧边栏选择设备类型（华为或中兴）和配置类型
3. 选择数据制作原因（下发失败、华为ONU或加装IPTV）
4. 填写必要的配置参数
5. 点击"配置生成"生成命令
6. 点击"添加数据"保存配置到数据库
7. 点击"查看数据"查看和管理已保存的配置
   - 普通用户只能查看和加载配置
   - 管理员用户可以查看、加载和删除配置
8. 点击"导出数据"导出配置到 CSV 文件

## 项目结构

```
my-app/
├── app/                    # Next.js 应用页面
│   ├── sign-in/            # 登录页面
│   ├── sign-up/            # 注册页面
│   ├── layout.tsx          # 应用布局组件
│   └── page.tsx            # 首页组件
├── components/             # React 组件
│   ├── ui/                 # UI 组件库
│   ├── configuration-tool.tsx  # 主配置工具组件
│   ├── data-viewer.tsx     # 数据查看组件 (带权限控制)
│   ├── header.tsx          # 页面头部组件
│   ├── main-content.tsx    # 主内容区域组件
│   └── sidebar.tsx         # 侧边栏组件
├── lib/                    # 工具和服务库
│   ├── database.ts         # 数据库操作函数
│   ├── supabaseClient.ts   # Supabase 客户端配置
│   └── utils.ts            # 工具函数
├── middleware.ts           # Next.js 中间件 (认证控制)
├── .env.local              # 环境变量配置
└── supabase.sql            # 数据库初始化 SQL
```

## 技术栈

- Next.js 15.1.0
- React 18
- TypeScript
- Tailwind CSS
- Supabase (数据库)
- Clerk (认证和用户管理)
- Shadcn UI (组件库)

## 版本更新

### 最新版本 (2024-03-11)
- 添加用户认证系统 (Clerk)
- 实现基于角色的访问控制
- 优化登录和注册页面
- 修复中间件配置问题
- 增强数据查看页面的权限控制

### 之前版本
- 完善数据导出功能
- 添加制作原因字段
- 整合框号/槽位/PON口显示逻辑
- 优化配置文件生成算法

## 授权许可

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

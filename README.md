# 珠有泪海洋生物科普网

这是一个基于Next.js开发的海洋生物科普网站，提供海洋生物分类、物种详情介绍、用户评论等功能。

## 主要功能

### 用户端功能
- 首页展示特色物种轮播和海洋生物分类
- 物种分类浏览
- 物种详情查看（包含照片、学术描述、保护级别、生活习性等信息）
- 用户注册和登录
- 评论功能
- 趣味小游戏
- 潮汐表
### 管理员功能
- 仪表盘数据统计
- 分类管理
- 物种管理
- 评论管理
- 用户管理
## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: SQLite (开发环境)
- **认证**: NextAuth.js

## 安装和运行

### 安装依赖

```bash
npm install
```

### 初始化数据库

```bash
npx prisma migrate dev
```

### 填充测试数据

```bash
npm run seed
```

### 启动开发服务器

```bash
npm run dev
```

## 测试账号

- 管理员账号: admin@example.com / admin123
- 用户账号: user@example.com / user123

## 项目结构

```
/app                   # Next.js App Router
  /api                 # API路由
    /auth              # 认证相关API
    /admin             # 管理后台API
    /comments          # 评论API
  /admin               # 管理后台页面
  /components          # 共享组件
  /categories          # 分类页面
  /species             # 物种页面
  /login               # 登录页面
  /register            # 注册页面
/prisma                # Prisma数据库配置
/public                # 静态资源
/scripts               # 脚本文件
```

## 部署

项目可以部署到Vercel或其他支持Next.js的平台:

```bash
npm run build
npm run start
```

## 作者

1、韩伟极
2、杨余龙
3、方锐

安装依赖: npm install
初始化数据库: npx prisma migrate dev
填充测试数据: npm run seed
安装date-fns日期处理库:npm install date-fns
安装 react-hot-toast 库npm install react-hot-toast
启动开发服务器: npm run dev

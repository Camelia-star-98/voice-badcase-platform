# 🚀 创建 Supabase 项目 - 完整指南

## 第 1 步：注册/登录 Supabase

### 1.1 访问网站
打开浏览器，访问：**https://supabase.com**

### 1.2 注册账号（如果没有）
点击右上角 **Sign Up**，可以选择：
- ✅ GitHub 账号登录（推荐，一键登录）
- ✅ 邮箱注册

---

## 第 2 步：创建新项目

### 2.1 进入控制台
登录后，会看到 Dashboard 页面，点击 **New Project**（新建项目）

### 2.2 填写项目信息

| 字段 | 填写内容 | 说明 |
|------|----------|------|
| **Project name** | `voice-badcase-platform` | 项目名称 |
| **Database Password** | 设置一个强密码 | ⚠️ **请记住这个密码！** |
| **Region** | `Northeast Asia (Tokyo)` | 选择东京服务器（离中国最近） |
| **Pricing Plan** | `Free` | 免费版足够使用 |

### 2.3 等待创建
点击 **Create new project**，等待 1-2 分钟，Supabase 会自动创建数据库。

---

## 第 3 步：获取项目配置信息

### 3.1 进入项目设置
项目创建完成后：
1. 点击左侧菜单 **⚙️ Settings**（设置）
2. 点击 **API**

### 3.2 复制配置信息

你会看到两个重要信息：

#### 📋 Project URL（项目 URL）
```
https://xxxxxxxxxxx.supabase.co
```
这就是 `VITE_SUPABASE_URL`

#### 🔑 anon public（匿名公钥）
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...（很长的字符串）
```
这就是 `VITE_SUPABASE_ANON_KEY`

---

## 第 4 步：更新环境变量文件

### 4.1 打开 .env.local 文件
```bash
cd /Users/ailian/Downloads/voice-badcase-platform
open .env.local
```

### 4.2 替换配置信息
将文件内容改为：

```env
# Supabase 配置
VITE_SUPABASE_URL=你刚才复制的Project URL
VITE_SUPABASE_ANON_KEY=你刚才复制的anon public
```

**示例：**
```env
# Supabase 配置
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM0MDg1NjIsImV4cCI6MjAxODk4NDU2Mn0.xxxxxxxxxxxxxxxxx
```

### 4.3 保存文件
按 `Cmd+S` 保存

---

## 第 5 步：初始化数据库表

### 5.1 打开 SQL Editor
在 Supabase 控制台：
1. 点击左侧菜单 **🔧 SQL Editor**
2. 点击 **➕ New query**

### 5.2 复制 SQL 脚本
打开项目文件：`database/init_badcases_table.sql`

全选并复制所有内容（包含以下内容）：

```sql
-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS badcases CASCADE;

-- 创建 badcases 表
CREATE TABLE badcases (
    id TEXT PRIMARY KEY,
    problem_text TEXT,
    audio_url TEXT,
    problem_description TEXT,
    detail_description TEXT,
    priority TEXT CHECK (priority IN ('P00', 'P0', 'P1', 'P2')),
    status TEXT,
    feedback_source TEXT,
    feedback_date TEXT,
    subject TEXT,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- （还有更多内容...）
```

### 5.3 执行 SQL
1. 粘贴到 SQL Editor
2. 点击右下角 **▶ Run** 按钮（或按 `Cmd+Enter`）
3. 等待看到 **✅ Success. No rows returned** 提示

### 5.4 验证表已创建
在左侧菜单点击 **📊 Table Editor**，应该能看到 `badcases` 表。

---

## 第 6 步：启动项目

### 6.1 启动开发服务器
```bash
cd /Users/ailian/Downloads/voice-badcase-platform
npm run dev
```

### 6.2 打开浏览器
自动打开 `http://localhost:3000`

### 6.3 验证连接
按 `F12` 打开浏览器控制台，应该看到：

```
🔍 Supabase 环境变量检查:
✅ VITE_SUPABASE_URL: 已设置
✅ VITE_SUPABASE_ANON_KEY: 已设置
✅ Supabase 客户端已初始化
🔧 API 模式: Supabase
```

---

## ✅ 完成！

现在你的项目已经连接到 Supabase 云数据库了！

### 🎯 快速测试

1. **上传数据**
   - 在 Badcase 列表页面
   - 点击"上传 Excel"按钮
   - 选择测试 Excel 文件
   - 上传成功后刷新页面

2. **查看数据**
   - 在 Supabase 控制台
   - 点击 **Table Editor** → **badcases**
   - 可以看到刚才上传的数据

---

## 📊 Supabase 免费版限额

| 资源 | 免费版限额 | 说明 |
|------|------------|------|
| 数据库空间 | 500 MB | 足够存储几千条 Badcase |
| 并发连接 | 60 个 | 支持多人同时使用 |
| API 请求 | 无限 | 不限制请求次数 |
| 存储空间 | 1 GB | 可以存储音频文件 |

对于个人项目和小团队来说，免费版完全够用！

---

## 🆘 常见问题

### Q1：忘记数据库密码怎么办？
A：在 Settings → Database 中可以重置密码，但不影响使用（项目已经配置好了）

### Q2：Region 选错了怎么办？
A：只能删除项目重新创建。建议选择 Tokyo 服务器速度最快。

### Q3：怎么查看数据？
A：在 Supabase 控制台 → Table Editor → badcases 表

### Q4：怎么删除测试数据？
A：在 Table Editor 中可以手动删除，或在 SQL Editor 执行：
```sql
DELETE FROM badcases;
```

### Q5：多个项目可以共用一个 Supabase 项目吗？
A：可以，但建议每个项目单独创建，方便管理。

---

## 🔒 安全提示

⚠️ **重要**：
- ✅ `.env.local` 文件已在 `.gitignore` 中，不会被提交到 Git
- ✅ 不要把 `ANON_KEY` 分享给别人
- ✅ 不要把密钥上传到 GitHub 等公开平台
- ✅ `anon public` 密钥是公开的，用于前端，安全级别较低
- ✅ 真正的敏感操作需要使用 `service_role` 密钥（后端使用）

---

## 📚 相关文档

- 🌐 [Supabase 官方文档](https://supabase.com/docs)
- 📖 [快速开始指南](./QUICK_START_SUPABASE.md)
- 📘 [详细配置指南](./SUPABASE_SETUP.md)

---

**🎉 现在就开始创建你的 Supabase 项目吧！**

整个过程只需 5-10 分钟，非常简单！


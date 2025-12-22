# 🚀 Supabase 配置指南

本文档将指导你如何为"语音 Badcase 平台"配置 Supabase 后端。

## 📋 前提条件

- 已有 Supabase 账号（如没有，请访问 https://supabase.com 注册）
- Node.js >= 16.0.0
- npm >= 7.0.0

---

## 第一步：创建 Supabase 项目

### 1.1 登录 Supabase

1. 访问：https://supabase.com
2. 登录你的账号
3. 点击 **"New Project"** 创建新项目

### 1.2 填写项目信息

- **Project Name**: `voice-badcase-platform`（或你喜欢的名称）
- **Database Password**: 设置一个强密码（请保存好）
- **Region**: 选择离你最近的区域（如 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
- **Pricing Plan**: 选择 Free 或根据需要选择付费计划

### 1.3 等待项目创建

项目创建通常需要 1-2 分钟。

---

## 第二步：创建数据库表

### 2.1 打开 SQL Editor

1. 在 Supabase 项目页面，点击左侧菜单的 **"SQL Editor"**
2. 点击 **"New query"** 创建新查询

### 2.2 执行数据库初始化脚本

复制项目根目录下的 `database/init_badcases_table.sql` 文件内容，粘贴到 SQL Editor 中，然后点击 **"Run"** 或按 `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)。

执行成功后，你应该会看到 "Success. No rows returned" 的提示。

### 2.3 验证表创建成功

1. 点击左侧菜单的 **"Table Editor"**
2. 你应该能看到 `badcases` 表
3. 点击表名查看字段结构

---

## 第三步：获取 API 凭证

### 3.1 打开 API 设置页面

1. 点击左侧菜单底部的 **"Settings"**（齿轮图标）
2. 选择 **"API"**

### 3.2 复制必要的信息

你需要复制以下两个信息：

1. **Project URL**（位于 "Project URL" 部分）
   - 格式类似：`https://xxxxx.supabase.co`

2. **anon public key**（位于 "Project API keys" 部分）
   - 这是一个很长的字符串，以 `eyJ` 开头

---

## 第四步：配置本地环境变量

### 4.1 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# 在项目根目录执行
touch .env.local
```

### 4.2 填写配置信息

打开 `.env.local` 文件，填入以下内容（替换为你自己的值）：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**示例：**

```env
VITE_SUPABASE_URL=https://bpivzznuvvbafsyvzxqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXZ6em51dnZiYWZzeXZ6eHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDg1NjIsImV4cCI6MjA0ODk4NDU2Mn0.cXDE2rwda9N9o_eBSZeW10_YuVNCN6BCHc0kcNCuTRw
```

### 4.3 验证配置

`.env.local` 文件已被添加到 `.gitignore`，不会被提交到 Git 仓库，以保护你的敏感信息。

---

## 第五步：启动项目

### 5.1 安装依赖（如果还没有）

```bash
npm install
```

### 5.2 启动开发服务器

```bash
npm run dev
```

### 5.3 检查连接状态

浏览器会自动打开 `http://localhost:3000`。

打开浏览器的开发者控制台（F12），你应该能看到类似这样的日志：

```
🔍 Supabase 环境变量检查:
✅ VITE_SUPABASE_URL: 已设置 (https://xxxxx.supabase.co)
✅ VITE_SUPABASE_ANON_KEY: 已设置 (长度: 218)
✅ Supabase 客户端已初始化
📍 Supabase URL: https://xxxxx.supabase.co
🔧 API 模式: Supabase
```

如果看到 ❌ 标记，说明环境变量配置有问题，请检查 `.env.local` 文件。

---

## 第六步：测试功能

### 6.1 上传测试数据

在 **"Badcase 列表"** 页面：

1. 点击 **"上传 Excel"** 按钮
2. 选择你的 Excel 文件（参考 `uploads` 目录下的示例文件）
3. 点击上传

### 6.2 验证数据

1. 回到 Supabase 控制台
2. 点击 **"Table Editor"** → **"badcases"**
3. 你应该能看到刚才上传的数据

### 6.3 测试其他功能

- 查看数据可视化图表
- 搜索和筛选 Badcase
- 查看详情
- 播放音频（如果有）

---

## 🔄 在 Supabase 和 Mock 数据之间切换

### 使用 Supabase（推荐）

确保 `.env.local` 文件存在且配置正确。

### 使用 Mock 数据（开发测试）

临时删除或重命名 `.env.local` 文件：

```bash
mv .env.local .env.local.backup
```

然后重启开发服务器。

### 恢复使用 Supabase

```bash
mv .env.local.backup .env.local
```

然后重启开发服务器。

---

## 📊 数据库表结构

### badcases 表

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | text | 主键，Badcase ID | ✅ |
| problem_text | text | 问题文本 | ✅ |
| audio_url | text | 音频文件 URL | ❌ |
| problem_description | text | 问题描述 | ✅ |
| detail_description | text | 详细描述 | ❌ |
| priority | text | 优先级 (P00/P0/P1/P2) | ✅ |
| feedback_source | text | 反馈来源 | ❌ |
| feedback_date | text | 反馈日期 | ❌ |
| feedback_person | text | 反馈人 | ❌ |
| creator | text | 创建人 | ❌ |
| status | text | 状态 | ✅ |
| subject | text | 学科 | ❌ |
| model_version | text | 模型版本 | ❌ |
| created_at | timestamptz | 创建时间 | 自动 |
| updated_at | timestamptz | 更新时间 | 自动 |

---

## 🔒 安全配置（可选）

### 配置行级安全策略 (RLS)

默认情况下，表的 RLS 是关闭的，所有人都可以读写数据。如果需要更高的安全性：

1. 在 Supabase 控制台打开 **"Authentication"** 设置身份验证
2. 在 **"Table Editor"** 中启用 RLS
3. 创建相应的安全策略

---

## 🐛 常见问题

### 1. 环境变量未生效

**症状**：控制台显示 "❌ VITE_SUPABASE_URL: 未设置"

**解决方案**：
- 确认 `.env.local` 文件在项目根目录
- 确认环境变量以 `VITE_` 开头
- 重启开发服务器（`Ctrl+C` 然后 `npm run dev`）

### 2. 连接失败

**症状**：控制台显示 "❌ Supabase 连接失败"

**解决方案**：
- 检查 Supabase URL 和 API Key 是否正确
- 确认 Supabase 项目是否正常运行
- 检查网络连接

### 3. 表不存在

**症状**：错误提示 "relation 'badcases' does not exist"

**解决方案**：
- 确认已执行数据库初始化脚本
- 在 Supabase 控制台的 Table Editor 中检查表是否存在

### 4. CORS 错误

**症状**：浏览器控制台显示 CORS 相关错误

**解决方案**：
- Supabase 默认允许所有源的请求，通常不会有 CORS 问题
- 如果出现，请检查 Supabase 项目的 API 设置

---

## 📚 更多资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [项目 README](./README.md)

---

## 💡 提示

- `.env.local` 文件包含敏感信息，**切勿**提交到 Git 仓库
- 定期备份 Supabase 数据库
- 建议为生产环境和开发环境使用不同的 Supabase 项目

---

## ✅ 配置完成！

如果一切正常，你现在应该可以：

- ✅ 在前端上传和查看 Badcase 数据
- ✅ 数据自动保存到 Supabase 云数据库
- ✅ 实时统计和可视化数据
- ✅ 多人协作使用同一个数据库

享受你的语音 Badcase 平台吧！🎉


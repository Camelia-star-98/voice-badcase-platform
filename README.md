# 🎤 语音 Badcase 数据可视化平台

一个基于 React + TypeScript + Ant Design + Supabase 构建的语音识别问题管理平台。

## ✨ 功能特性

- 📊 **数据可视化**：实时展示问题统计、趋势分析
- 📝 **问题管理**：创建、编辑、删除 Badcase 记录
- 🔍 **高级筛选**：按状态、分类、学科等多维度筛选
- 📈 **状态流转**：可视化问题处理流程
- 🎯 **响应式设计**：完美适配桌面和移动端
- 🔔 **实时同步**：多用户协作，数据实时更新
- 📤 **Excel 导入**：支持批量上传 Badcase 数据
- 🤖 **钉钉集成**：通过钉钉机器人快速提报问题 🆕

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

按照 [Supabase 配置指南](./SUPABASE_SETUP.md) 完成以下步骤：

1. 创建 Supabase 项目
2. 执行数据库初始化脚本（`database/create_badcases_table.sql`）
3. 获取 API 凭证
4. 配置环境变量

创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

## 📦 技术栈

- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5
- **数据库**: Supabase (PostgreSQL)
- **构建工具**: Vite
- **路由**: React Router v6

## 🔔 实时同步功能

支持多用户实时协作，一个用户的操作会立即同步到其他用户：

- ➕ 新增 badcase → 所有用户立即看到
- ✏️ 编辑 badcase → 所有用户立即更新
- 🗑️ 删除 badcase → 所有用户立即同步

### 启用实时同步

在 Supabase Dashboard 中：
1. 进入 **Database** → **Replication**
2. 勾选 `badcases` 表
3. 点击保存

## 🤖 钉钉机器人集成

支持通过钉钉机器人快速提报 Badcase，无需登录平台！

### 快速配置（12分钟）

1. **创建钉钉机器人**：在钉钉群中添加自定义机器人
2. **配置环境变量**：添加 `DINGTALK_SECRET`
3. **部署代码**：推送到 Vercel
4. **开始使用**：在钉钉群中发送提报消息

详细步骤查看：
- 📘 [完整集成指南](./DINGTALK_INTEGRATION.md)
- ⚡ [快速配置清单](./DINGTALK_QUICKSTART.md)

### 使用示例

在钉钉群中发送：

```
提报问题
学科：英语
分类：读音错误
描述：A相关的单词发音不准确
提报人：张三
```

机器人自动创建记录并回复确认 ✅

### 辅助工具

访问 `https://your-project.vercel.app/dingtalk-helper.html` 使用网页助手生成标准格式消息。

## 📊 数据库表结构

### badcases 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | text | 主键，Badcase ID |
| date | text | 日期 |
| subject | text | 学科 |
| location | text | 位置/章节 |
| full_tts_lesson_id | text | 完整 TTS 课程 ID |
| cms_id | text | CMS ID |
| reporter | text | 报告人 |
| category | text | 分类 |
| expected_fix_date | text | 预期修复日期 |
| status | text | 状态 |
| description | text | 问题描述 |
| audio_url | text | 音频文件 URL |
| model_id | text | 模型 ID |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

## 📖 文档

- 📘 [Supabase 配置指南](./SUPABASE_SETUP.md)
- 🤖 [钉钉机器人集成指南](./DINGTALK_INTEGRATION.md) 🆕
- ⚡ [钉钉快速配置清单](./DINGTALK_QUICKSTART.md) 🆕
- 📁 [数据库脚本](./database/)

## 🌐 部署

本项目支持部署到 Vercel、Netlify 等静态托管平台。

### Vercel 部署

1. 导入项目到 Vercel
2. 添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `DINGTALK_SECRET`（可选，钉钉集成需要）
3. 部署

部署后即可访问：
- 🏠 主平台：`https://your-project.vercel.app`
- 🤖 钉钉助手：`https://your-project.vercel.app/dingtalk-helper.html`
- 🔌 Webhook：`https://your-project.vercel.app/api/dingtalk-webhook`

## 📄 License

MIT

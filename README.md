# 🎤 语音 Badcase 数据可视化平台

一个基于 React + TypeScript + Ant Design + Supabase 构建的语音识别问题管理平台。

## ✨ 功能特性

- 📊 **数据可视化**：实时展示问题统计、趋势分析
- 📝 **问题管理**：创建、编辑、删除 Badcase 记录
- 🔍 **高级筛选**：按状态、优先级、学科等多维度筛选
- 📈 **图表展示**：ECharts 驱动的多种图表
- 🎯 **响应式设计**：完美适配桌面和移动端
- 🔔 **实时同步**：多用户协作，数据实时更新 (NEW!)

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境变量

创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 技术栈

- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5
- **图表**: ECharts
- **数据库**: Supabase (PostgreSQL)
- **构建工具**: Vite
- **路由**: React Router v6

## 🌐 部署

本项目已配置 Vercel 自动部署。

## 🔔 Realtime 实时同步 (NEW!)

支持多用户实时协作，一个用户的操作会立即同步到其他用户：

- ➕ 新增 badcase → 所有用户立即看到
- ✏️ 编辑 badcase → 所有用户立即更新
- 🗑️ 删除 badcase → 所有用户立即同步

### 设置步骤

1. **启用 Supabase Realtime**
   - 访问 [Supabase Dashboard](https://app.supabase.com)
   - 进入 Database → Replication
   - 勾选 `badcases` 表

2. **测试实时同步**
   - 打开两个浏览器窗口
   - 在一个窗口操作，观察另一个窗口的实时更新

3. **详细文档**
   - 📖 [配置指南](./REALTIME_SETUP.md)
   - 🧪 [测试指南](./TEST_REALTIME.md)
   - 🔧 [测试页面](./test-realtime.html)

## 📄 License

MIT

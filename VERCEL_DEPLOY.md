# 🚀 Vercel 部署配置指南

## 问题诊断

如果 Vercel 页面显示 Supabase 连接失败（ERR_NAME_NOT_RESOLVED 或连接到错误的 URL），说明环境变量未正确配置。

本地开发环境通过 `.env.local` 文件配置，但 **Vercel 需要在平台上单独配置环境变量**。

---

## ✅ 解决方案：配置 Vercel 环境变量

### 方法 1：通过 Vercel 控制台配置（推荐）⭐

#### 步骤 1: 登录 Vercel
访问 https://vercel.com 并登录你的账号

#### 步骤 2: 进入项目设置
1. 在 Dashboard 找到 `voice-badcase-platform` 项目
2. 点击项目进入详情页
3. 点击顶部导航栏的 **Settings** 标签

#### 步骤 3: 配置环境变量
1. 在左侧菜单选择 **Environment Variables**
2. 点击 **Add New** 按钮
3. 添加以下两个环境变量：

**环境变量 1 - Supabase URL:**
```
Name:        VITE_SUPABASE_URL
Value:       https://mcpyilgpotajpmgblorc.supabase.co
Environment: ✅ Production
             ✅ Preview  
             ✅ Development
```

**环境变量 2 - Supabase Anon Key:**
```
Name:        VITE_SUPABASE_ANON_KEY
Value:       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcHlpbGdwb3RhanBtZ2Jsb3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODUxNzMsImV4cCI6MjA4MTk2MTE3M30.mmVnFh6uDlRdlOKmtKQSd2WnLBKd4ApE4OWqIMu-41c
Environment: ✅ Production
             ✅ Preview
             ✅ Development
```

⚠️ **重要**: 确保三个环境（Production, Preview, Development）都勾选上！

#### 步骤 4: 重新部署项目

配置完环境变量后，需要重新部署才能生效：

**方式 A - 自动触发重新部署（推荐）:**
```bash
# 在本地项目目录执行
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push
```

**方式 B - 手动在 Vercel 控制台重新部署:**
1. 回到项目主页，点击 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右侧的三个点菜单 `⋮`
4. 选择 **Redeploy**
5. 在弹出框中点击 **Redeploy** 确认

#### 步骤 5: 验证部署
1. 等待部署完成（通常 1-3 分钟）
2. 访问你的 Vercel 部署 URL
3. 打开浏览器控制台（F12）
4. 查看控制台日志，应该看到：
   - ✅ `Supabase 环境变量检查通过`
   - ✅ `Supabase 客户端已初始化`
   - ✅ `Supabase 连接成功`

---

### 方法 2：通过 Vercel CLI 配置

如果你已安装 Vercel CLI，可以使用命令行配置：

#### 安装 Vercel CLI（如果还未安装）
```bash
npm i -g vercel
```

#### 登录 Vercel
```bash
vercel login
```

#### 链接项目
```bash
cd /path/to/voice-badcase-platform
vercel link
```

#### 运行配置脚本
```bash
./setup-vercel-env.sh
```

或手动添加环境变量：
```bash
vercel env add VITE_SUPABASE_URL production preview development
# 输入: https://mcpyilgpotajpmgblorc.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production preview development
# 输入: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jcHlpbGdwb3RhanBtZ2Jsb3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODUxNzMsImV4cCI6MjA4MTk2MTE3M30.mmVnFh6uDlRdlOKmtKQSd2WnLBKd4ApE4OWqIMu-41c
```

#### 触发重新部署
```bash
vercel --prod
```

---

## 🔍 常见问题排查

### 问题 1: 配置了环境变量但还是连接失败

**原因**: 环境变量配置后需要重新部署才能生效

**解决**: 
- 方法 A: `git commit --allow-empty -m "trigger deploy" && git push`
- 方法 B: 在 Vercel 控制台手动 Redeploy

### 问题 2: 显示连接到错误的 Supabase URL

**原因**: 可能存在旧的环境变量配置

**解决**:
1. 进入 Vercel Settings > Environment Variables
2. 删除旧的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`（如果存在）
3. 确保只保留 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
4. 重新部署

### 问题 3: 环境变量在某些环境不生效

**原因**: 没有为所有环境（Production, Preview, Development）都配置

**解决**: 编辑环境变量，确保三个环境都勾选

### 问题 4: 部署成功但页面空白或报错

**原因**: 可能是构建缓存问题

**解决**: 重新部署时取消勾选 "Use existing Build Cache"

---

## 📋 验证清单

部署后，请检查以下几点：

- [ ] Vercel 环境变量已配置（Settings > Environment Variables）
- [ ] 环境变量名称正确：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- [ ] 所有环境（Production/Preview/Development）都已勾选
- [ ] 配置后已重新部署
- [ ] 浏览器控制台显示 "Supabase 连接成功"
- [ ] 页面能正常加载和使用

---

## 🎯 快速检查命令

查看当前 Vercel 环境变量：
```bash
vercel env ls
```

拉取 Vercel 环境变量到本地（用于调试）：
```bash
vercel env pull .env.vercel
```

---

## 📞 需要帮助？

如果按照以上步骤操作后仍有问题：

1. 检查浏览器控制台的完整错误信息
2. 在 Vercel 部署日志中查看构建过程
3. 确认 Supabase 项目状态正常（https://supabase.com/dashboard）
4. 验证 Supabase URL 和 Key 是否正确

---

## 📝 相关文档

- [Supabase 配置指南](./SUPABASE_SETUP.md)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)


<!-- Updated: Tue Dec 23 12:27:09 CST 2025 -->

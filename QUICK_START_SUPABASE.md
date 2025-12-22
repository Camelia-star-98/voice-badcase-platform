# ⚡ Supabase 快速开始指南

5 分钟快速配置 Supabase 后端！

## 📝 第一步：创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.local.example .env.local
```

或者手动创建文件，内容如下：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔑 第二步：获取 Supabase 凭证

### 如果你已有 Supabase 项目：

1. 登录 https://supabase.com
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制：
   - **Project URL** → 填入 `VITE_SUPABASE_URL`
   - **anon public key** → 填入 `VITE_SUPABASE_ANON_KEY`

### 如果还没有 Supabase 项目：

1. 访问 https://supabase.com 注册账号
2. 创建新项目（选择离你最近的区域）
3. 等待 1-2 分钟项目初始化完成
4. 按照上面的步骤获取凭证

## 🗄️ 第三步：创建数据库表

1. 在 Supabase 控制台，点击 **SQL Editor**
2. 点击 **New query**
3. 复制 `database/init_badcases_table.sql` 文件的全部内容
4. 粘贴到编辑器，点击 **Run** 或按 `Cmd+Enter`
5. 看到 "Success" 提示即可

## 🚀 第四步：启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

## ✅ 第五步：验证连接

打开浏览器控制台（按 F12），查看日志：

```
✅ VITE_SUPABASE_URL: 已设置
✅ VITE_SUPABASE_ANON_KEY: 已设置
✅ Supabase 客户端已初始化
🔧 API 模式: Supabase
```

如果看到 ✅，恭喜你配置成功！

## 🎉 完成！

现在你可以：

- ✅ 上传和管理 Badcase 数据
- ✅ 查看数据可视化图表
- ✅ 搜索和筛选数据
- ✅ 数据自动同步到云端

---

## 🐛 遇到问题？

### 问题 1：环境变量未生效

**解决方案**：重启开发服务器
```bash
# 按 Ctrl+C 停止服务器，然后重新启动
npm run dev
```

### 问题 2：连接失败

**检查清单**：
- [ ] URL 和 Key 是否正确复制（注意不要有空格）
- [ ] Supabase 项目是否正常运行
- [ ] 网络连接是否正常

### 问题 3：表不存在

**解决方案**：重新执行数据库初始化脚本（第三步）

---

## 📚 需要更详细的文档？

查看 [完整 Supabase 配置指南](./SUPABASE_SETUP.md)

---

## 💡 提示

- 现在使用的是 Supabase URL 和 Key，因为我已经从 annotation-platform 项目复制了配置
- 如果你想使用自己的 Supabase 项目，请按照上述步骤修改 `.env.local` 文件
- `.env.local` 文件已被加入 `.gitignore`，不会被提交到 Git

祝使用愉快！🎊


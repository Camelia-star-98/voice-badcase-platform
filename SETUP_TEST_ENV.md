# 🔒 测试环境设置指南（防止误操作生产数据库）

## 🎯 目标
设置一个**完全隔离的测试环境**，确保**绝对不会**修改正式数据库。

---

## 📝 第一步：创建 Supabase 测试项目（必须）

### 1.1 创建新项目

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **创建测试项目**
   - 点击右上角 **"New Project"**
   - 填写信息：
     - **Project Name**: `voice-badcase-test` ⭐（建议名称，方便识别）
     - **Database Password**: 设置密码（记住它）
     - **Region**: 选择任意区域
     - **Pricing Plan**: 选择 **Free**（免费版足够测试）
   - 点击 **"Create new project"**
   - 等待创建完成（约1-2分钟）

### 1.2 获取测试项目配置

1. **进入项目设置**
   - 在 Supabase Dashboard 中选择刚创建的测试项目
   - 点击左侧菜单 **"Settings"**（齿轮图标）
   - 选择 **"API"** 标签页

2. **复制配置信息** ⭐（重要！）
   - 复制 **Project URL**（类似：`https://abcdefghijklmnop.supabase.co`）
   - 复制 **anon public** key（很长的字符串，以 `eyJ` 开头）
   - **保存这两个值**，下一步会用到

### 1.3 初始化测试数据库

1. **打开 SQL Editor**
   - 在测试项目中，点击左侧菜单 **"SQL Editor"**
   - 点击 **"New query"**

2. **执行基础表创建脚本**
   - 打开文件：`database/create_badcases_table.sql`
   - 复制**全部内容**
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行
   - ✅ 应该看到 "✅ Badcases 表创建成功！" 的提示

3. **执行优先级字段迁移脚本**
   - 打开文件：`database/add_priority_column.sql`
   - 复制**全部内容**
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行
   - ✅ 应该看到 "✅ Priority 字段添加成功！" 的提示

4. **验证表结构**
   - 点击左侧菜单 **"Table Editor"**
   - 选择 `badcases` 表
   - ✅ 确认能看到 `priority` 字段

---

## 📝 第二步：配置测试环境变量

### 2.1 创建测试配置文件

```bash
cd /Users/yanglurui/voice-badcase-platform

# 复制配置模板
cp .env.local.example .env.local.test
```

### 2.2 编辑测试配置文件

```bash
# 使用你喜欢的编辑器打开
nano .env.local.test
# 或者
code .env.local.test
# 或者用其他编辑器
```

### 2.3 填入测试项目配置

**编辑 `.env.local.test` 文件，填入以下内容：**

```env
# TEST ENVIRONMENT - 测试环境配置
# 这是测试环境，不会影响生产数据
# SAFE TEST ENV - DO NOT MODIFY PRODUCTION DATABASE

VITE_SUPABASE_URL=https://你的测试项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的测试项目anon key
```

**示例：**
```env
# TEST ENVIRONMENT - 测试环境配置
# 这是测试环境，不会影响生产数据
# SAFE TEST ENV - DO NOT MODIFY PRODUCTION DATABASE

VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzQwODU2MiwiZXhwIjoyMDQ4OTg0NTYyf0.xxxxxxxxxxxxx
```

**⚠️ 重要：**
- 确保填入的是**测试项目**的配置，不是生产项目的！
- 可以通过项目名称确认（测试项目名应该包含 `test`）

### 2.4 保存文件

保存并关闭编辑器。

---

## 📝 第三步：使用安全启动脚本启动

### 3.1 使用测试环境启动脚本

```bash
cd /Users/yanglurui/voice-badcase-platform

# 使用安全启动脚本（会自动切换到测试环境）
./start-test-env.sh
```

**这个脚本会：**
- ✅ 自动检查测试环境配置是否存在
- ✅ 强制切换到测试环境配置
- ✅ 备份生产环境配置（如果存在）
- ✅ 添加安全标记，防止误操作
- ✅ 启动开发服务器

### 3.2 访问地址

启动成功后，访问：
```
http://localhost:5173
```

---

## ✅ 验证测试环境

### 验证点1：确认连接的是测试项目

1. **打开浏览器开发者工具**
   - 按 `F12` 或右键 → **"检查"**
   - 切换到 **"Console"** 标签页

2. **查看 Supabase 连接信息**
   - 应该能看到 Supabase URL
   - ✅ 确认 URL 指向测试项目（不是生产项目）

### 验证点2：测试功能

1. **创建测试数据**
   - 点击 **"新建Badcase"**
   - 填写信息，选择优先级
   - 提交

2. **验证数据保存位置**
   - 回到 Supabase Dashboard
   - ✅ 确认数据保存在**测试项目**中，不是生产项目

---

## 🔒 安全措施说明

### 1. 环境隔离
- 测试环境使用独立的 Supabase 项目
- 完全隔离，不会影响生产数据

### 2. 启动脚本保护
- `start-test-env.sh` 脚本会：
  - 强制使用测试环境配置
  - 检查配置是否正确
  - 添加安全标记

### 3. 配置文件保护
- `.env.local.test` 已添加到 `.gitignore`
- 不会意外提交到 Git

### 4. 双重确认
- 测试项目名称包含 `test`
- 配置文件中添加了 `# TEST ENVIRONMENT` 标记

---

## 🚨 重要提示

### ⚠️ 永远不要：

1. **不要直接修改 `.env.local`**
   - 始终使用 `start-test-env.sh` 脚本启动
   - 脚本会自动切换到测试环境

2. **不要使用生产项目的配置**
   - 确保 `.env.local.test` 中的 URL 是测试项目的
   - 如果不确定，重新创建测试项目

3. **不要在生产环境中测试**
   - 如果看到生产数据，立即停止
   - 检查配置文件是否正确

### ✅ 安全做法：

1. **始终使用启动脚本**
   ```bash
   ./start-test-env.sh
   ```

2. **定期检查连接**
   - 启动后检查浏览器 Console
   - 确认连接的是测试项目

3. **测试前验证**
   - 在测试项目中创建一条测试数据
   - 确认数据出现在测试项目中，不是生产项目

---

## 📋 快速检查清单

在开始测试前，确认：

- [ ] ✅ 已创建 Supabase 测试项目（名称包含 `test`）
- [ ] ✅ 已执行数据库迁移脚本（创建表和添加优先级字段）
- [ ] ✅ 已创建 `.env.local.test` 配置文件
- [ ] ✅ 配置文件中填入的是测试项目的 URL 和 Key
- [ ] ✅ 使用 `./start-test-env.sh` 启动（不是直接 `npm run dev`）
- [ ] ✅ 浏览器 Console 显示连接的是测试项目

---

## 🎉 完成！

现在你可以安全地测试"修复优先级"功能了！

- ✅ 完全隔离的测试环境
- ✅ 不会影响生产数据库
- ✅ 可以随意测试新功能

**访问地址：** http://localhost:5173

---

## 🆘 遇到问题？

### 问题1：启动脚本报错"配置文件不存在"

**解决方法：**
```bash
# 创建测试配置文件
cp .env.local.example .env.local.test
# 然后编辑 .env.local.test，填入测试项目配置
```

### 问题2：不确定连接的是哪个项目

**解决方法：**
1. 打开浏览器 Console（F12）
2. 查看 Supabase URL
3. 在 Supabase Dashboard 中确认项目 URL
4. 对比确认是否一致

### 问题3：想切换回生产环境

**注意：** 测试环境启动脚本会保护生产环境，不会意外切换。

如果确实需要切换回生产环境：
```bash
# 手动恢复生产配置（谨慎操作！）
./switch-env.sh prod
```

---

**祝你测试顺利！** 🚀






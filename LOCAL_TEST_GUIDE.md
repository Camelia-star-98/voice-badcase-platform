# 🧪 本地测试指南（连接正式 Supabase）

## ⚠️ 重要提示

**此配置会连接到正式的 Supabase 项目，数据操作会直接影响生产数据库。**

请谨慎操作，建议：
- ✅ 测试前先备份重要数据
- ✅ 使用测试数据，不要修改重要数据
- ✅ 测试完成后检查数据完整性

---

## 📋 第一步：配置环境变量

### 1.1 创建配置文件

```bash
cd /Users/yanglurui/voice-badcase-platform

# 复制配置模板
cp .env.local.example .env.local
```

### 1.2 编辑配置文件

```bash
# 使用你喜欢的编辑器打开
nano .env.local
# 或者
code .env.local
```

### 1.3 填入正式 Supabase 项目配置

**编辑 `.env.local` 文件，填入以下内容：**

```env
VITE_SUPABASE_URL=https://你的正式项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的正式项目anon key
```

**如何获取配置：**
1. 访问：https://supabase.com/dashboard
2. 选择你的正式项目
3. 点击 **Settings** → **API**
4. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

**示例：**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzQwODU2MiwiZXhwIjoyMDQ4OTg0NTYyf0.xxxxxxxxxxxxx
```

### 1.4 保存文件

保存并关闭编辑器。

---

## 📋 第二步：执行数据库迁移（添加优先级字段）

### 2.1 登录 Supabase Dashboard

1. 访问：https://supabase.com/dashboard
2. 选择你的正式项目

### 2.2 执行迁移脚本

1. **打开 SQL Editor**
   - 点击左侧菜单 **"SQL Editor"**
   - 点击 **"New query"**

2. **执行优先级字段迁移脚本**
   - 打开文件：`database/add_priority_column.sql`
   - 复制**全部内容**
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行
   - ✅ 应该看到 "✅ Priority 字段添加成功！" 的提示

3. **验证字段添加成功**
   - 点击左侧菜单 **"Table Editor"**
   - 选择 `badcases` 表
   - ✅ 确认能看到 `priority` 字段（类型为 TEXT，默认值为 'medium'）

---

## 📋 第三步：启动开发服务器

### 3.1 使用启动脚本（推荐）

```bash
cd /Users/yanglurui/voice-badcase-platform
./start-dev.sh
```

### 3.2 或直接启动

```bash
npm run dev
```

### 3.3 访问平台

启动成功后，访问：
```
http://localhost:5173
```

---

## ✅ 验证优先级功能

### 验证点1：新建 Badcase 时选择优先级

1. **打开新建表单**
   - 点击 **"新建Badcase"** 按钮

2. **填写信息并选择优先级**
   - 填写所有必填字段
   - **找到"修复优先级"字段**
   - 选择优先级：高、中、低（默认是"中"）

3. **提交并验证**
   - 点击 **"提交"**
   - 回到列表页面
   - ✅ 确认新记录显示优先级（带颜色的 Tag）

### 验证点2：优先级筛选功能

1. **使用筛选器**
   - 在列表页面上方找到 **"全部优先级"** 下拉选择器
   - 选择某个优先级（如"高"）
   - 点击 **"搜索"**
   - ✅ 确认列表只显示对应优先级的记录

2. **使用列筛选**
   - 点击优先级列的列头筛选图标
   - 选择优先级
   - ✅ 确认筛选功能正常

### 验证点3：优先级排序

1. **测试排序功能**
   - 点击优先级列的列头
   - ✅ 确认高优先级在前（高 → 中 → 低）

### 验证点4：详情显示

1. **查看详情**
   - 点击任意记录的 **"查看"** 按钮
   - ✅ 确认详情 Modal 中显示优先级

---

## 🔒 安全建议

### 1. 测试前备份数据（推荐）

在 Supabase Dashboard 中：
1. 点击 **Settings** → **Database**
2. 点击 **Backups**（如果有备份功能）
3. 或手动导出重要数据

### 2. 使用测试数据

- ✅ 创建测试记录时使用明显的测试标识
- ✅ 测试完成后可以删除测试数据
- ✅ 不要修改重要的生产数据

### 3. 检查数据完整性

测试完成后：
- 检查数据库中的记录
- 确认优先级字段正确保存
- 确认没有数据丢失

---

## 🐛 常见问题

### 问题1：优先级字段不显示

**解决方法：**
- 确认已执行 `database/add_priority_column.sql` 迁移脚本
- 检查 Supabase 表结构，确认 `priority` 字段存在

### 问题2：连接失败

**解决方法：**
- 检查 `.env.local` 配置是否正确
- 确认 Supabase 项目正常运行
- 检查网络连接

### 问题3：数据未保存

**解决方法：**
- 打开浏览器开发者工具（F12）
- 查看 Console 是否有错误
- 检查 Supabase 连接状态

---

## 📋 快速检查清单

- [ ] ✅ 已创建 `.env.local` 配置文件
- [ ] ✅ 已填入正式 Supabase 项目配置
- [ ] ✅ 已执行数据库迁移脚本（添加 priority 字段）
- [ ] ✅ 已启动开发服务器
- [ ] ✅ 可以访问 http://localhost:5173
- [ ] ✅ 新建 Badcase 时可以选择优先级
- [ ] ✅ 列表页面显示优先级列
- [ ] ✅ 优先级筛选功能正常
- [ ] ✅ 优先级排序功能正常

---

## 🎉 完成！

现在你可以在本地测试"修复优先级"功能了！

**访问地址：** http://localhost:5173

**启动命令：**
```bash
./start-dev.sh
# 或
npm run dev
```

---

## ⚠️ 再次提醒

- 此环境连接到正式 Supabase 项目
- 数据操作会直接影响生产数据库
- 请谨慎操作，建议先备份重要数据

**祝你测试顺利！** 🚀






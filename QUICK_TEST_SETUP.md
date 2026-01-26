# ⚡ 快速测试环境设置（5分钟）

## 🎯 目标
创建一个完全独立的测试环境，不影响生产数据和主分支功能。

---

## 📝 步骤1：创建 Supabase 测试项目（2分钟）

1. 访问：https://supabase.com/dashboard
2. 点击 **"New Project"**
3. 填写：
   - **名称**：`voice-badcase-test`（任意名称）
   - **密码**：设置一个密码
   - **区域**：任意
   - **计划**：Free
4. 等待创建完成（约1-2分钟）

---

## 📝 步骤2：初始化测试数据库（2分钟）

在测试项目的 SQL Editor 中依次执行：

### 2.1 创建基础表
- 打开 `database/create_badcases_table.sql`
- 复制全部内容
- 在 SQL Editor 中执行

### 2.2 添加优先级字段
- 打开 `database/add_priority_column.sql`
- 复制全部内容
- 在 SQL Editor 中执行

---

## 📝 步骤3：配置测试环境变量（1分钟）

1. **获取测试项目配置**
   - 在 Supabase Dashboard 中选择测试项目
   - 点击 **Settings** → **API**
   - 复制：
     - **Project URL**（类似：`https://xxxxx.supabase.co`）
     - **anon public** key（很长的字符串）

2. **创建测试配置文件**
   ```bash
   cd /Users/yanglurui/voice-badcase-platform
   cp .env.local.example .env.local.test
   ```

3. **编辑 `.env.local.test`**
   填入测试项目的配置：
   ```env
   VITE_SUPABASE_URL=https://你的测试项目ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的测试项目anon key
   ```

---

## 📝 步骤4：切换到测试环境并启动

```bash
# 切换到测试环境
./switch-env.sh test

# 启动开发服务器
npm run dev
```

访问：http://localhost:5173

---

## ✅ 验证测试环境

1. **确认连接的是测试项目**
   - 打开浏览器开发者工具（F12）
   - 查看 Console，应该看到 Supabase URL 指向测试项目

2. **测试功能**
   - 创建新的 Badcase，选择优先级
   - 验证优先级显示和筛选功能
   - 可以随意测试，不会影响生产数据

---

## 🔄 测试完成后切换回生产环境

```bash
./switch-env.sh prod
```

或者手动恢复：
```bash
# 如果有备份
mv .env.local.backup .env.local

# 或者手动编辑 .env.local，填入生产环境配置
```

---

## 🗑️ 清理测试数据（可选）

测试完成后，可以：

1. **删除测试项目**
   - 在 Supabase Dashboard 中选择测试项目
   - Settings → General → Delete Project

2. **或者清空测试数据**
   ```sql
   -- 在测试项目的 SQL Editor 中执行
   TRUNCATE TABLE public.badcases;
   ```

---

## ⚠️ 重要提示

1. **不要提交测试配置**
   - `.env.local.test` 已在 `.gitignore` 中
   - 确保不要提交包含真实密钥的文件

2. **测试环境独立**
   - 测试环境的数据不会影响生产环境
   - 可以随意测试，不用担心

3. **保持环境一致**
   - 测试环境的表结构应该与生产环境一致
   - 确保迁移脚本在两个环境都能正常工作

---

## 🎉 完成！

现在你可以安全地测试新功能了！

- ✅ 完全隔离的测试环境
- ✅ 不影响生产数据
- ✅ 可以随时删除重建
- ✅ 一键切换环境

**祝你测试顺利！** 🚀






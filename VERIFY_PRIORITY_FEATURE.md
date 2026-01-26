# ✅ 修复优先级功能 - 完整验证指南

## 🎯 验证目标
在独立的测试环境中验证"修复优先级"功能，确保不影响生产数据。

---

## 📋 第一步：设置测试环境（5分钟）

### 1.1 创建 Supabase 测试项目

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **创建新项目**
   - 点击右上角 **"New Project"**
   - 填写信息：
     - **Project Name**: `voice-badcase-test`（或任意名称）
     - **Database Password**: 设置一个强密码（记住它）
     - **Region**: 选择任意区域（如 Northeast Asia）
     - **Pricing Plan**: 选择 **Free**
   - 点击 **"Create new project"**
   - 等待创建完成（约1-2分钟）

### 1.2 获取测试项目配置

1. **进入项目设置**
   - 在 Supabase Dashboard 中选择刚创建的测试项目
   - 点击左侧菜单 **"Settings"**（齿轮图标）
   - 选择 **"API"** 标签页

2. **复制配置信息**
   - 复制 **Project URL**（类似：`https://xxxxx.supabase.co`）
   - 复制 **anon public** key（很长的字符串，以 `eyJ` 开头）
   - 保存这两个值，稍后会用到

### 1.3 初始化测试数据库

1. **打开 SQL Editor**
   - 在测试项目中，点击左侧菜单 **"SQL Editor"**
   - 点击 **"New query"**

2. **执行基础表创建脚本**
   - 打开文件：`database/create_badcases_table.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行
   - 应该看到 "✅ Badcases 表创建成功！" 的提示

3. **执行优先级字段迁移脚本**
   - 打开文件：`database/add_priority_column.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行
   - 应该看到 "✅ Priority 字段添加成功！" 的提示

4. **验证表结构**
   - 点击左侧菜单 **"Table Editor"**
   - 选择 `badcases` 表
   - 确认能看到 `priority` 字段（类型为 TEXT，默认值为 'medium'）

### 1.4 配置测试环境变量

1. **创建测试配置文件**
   ```bash
   cd /Users/yanglurui/voice-badcase-platform
   cp .env.local.example .env.local.test
   ```

2. **编辑测试配置文件**
   ```bash
   # 使用你喜欢的编辑器打开 .env.local.test
   # 例如：nano .env.local.test 或 code .env.local.test
   ```

3. **填入测试项目配置**
   ```env
   VITE_SUPABASE_URL=https://你的测试项目ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的测试项目anon key
   ```
   
   **示例：**
   ```env
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMzQwODU2MiwiZXhwIjoyMDQ4OTg0NTYyf0.xxxxxxxxxxxxx
   ```

4. **保存文件**

### 1.5 切换到测试环境

```bash
cd /Users/yanglurui/voice-badcase-platform

# 切换到测试环境（会自动备份当前配置）
./switch-env.sh test
```

**预期输出：**
```
✅ 已备份当前配置到 .env.local.backup
✅ 已切换到测试环境
📝 提示：测试完成后运行 './switch-env.sh prod' 切换回生产环境
```

---

## 📋 第二步：启动开发服务器

```bash
# 确保在项目根目录
cd /Users/yanglurui/voice-badcase-platform

# 启动开发服务器
npm run dev
```

**预期输出：**
```
  VITE v5.0.8  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**访问：** http://localhost:5173

---

## 📋 第三步：验证优先级功能

### ✅ 验证点1：新建 Badcase 时选择优先级

1. **打开新建表单**
   - 在列表页面，点击 **"新建Badcase"** 按钮（右上角紫色按钮）

2. **填写基本信息**
   - 选择学科（如：英语）
   - 选择出现位置（如：行课互动部分）
   - 填写 CMS课节ID（如：12345）
   - 填写问题提报人（如：测试用户）
   - 选择问题模型ID（根据学科显示）
   - 选择分类（如：读音错误）
   - 选择期望修复时间

3. **验证优先级选择器** ⭐
   - 找到 **"修复优先级"** 字段
   - **验证默认值**：应该默认选择 **"中"**
   - **验证选项**：下拉菜单应该有三个选项：
     - 高
     - 中
     - 低
   - **选择一个优先级**：选择 **"高"**

4. **填写问题描述**
   - 输入至少10个字符的描述（如：测试优先级功能）

5. **提交表单**
   - 点击 **"提交"** 按钮
   - 应该看到成功提示："Badcase上传成功！"

6. **验证数据保存**
   - 回到列表页面
   - 找到刚才创建的记录
   - **验证优先级显示**：应该看到红色的 **"高"** Tag

---

### ✅ 验证点2：列表页面显示优先级列

1. **查看表格列**
   - 在 Badcase 列表页面
   - **验证优先级列存在**：
     - 应该有一列标题为 **"优先级"**
     - 位置在 **"状态"** 列之后

2. **验证优先级显示**
   - 查看表格中的优先级列
   - **验证显示格式**：
     - 应该显示为带颜色的 Tag
     - **高** = 红色 Tag
     - **中** = 橙色 Tag
     - **低** = 蓝色 Tag

3. **验证默认值**
   - 如果看到没有设置优先级的记录（旧数据）
   - 应该显示为 **"中"**（橙色 Tag）

---

### ✅ 验证点3：优先级筛选功能

1. **找到筛选区域**
   - 在列表页面上方的筛选卡片中
   - 找到 **"全部优先级"** 下拉选择器

2. **测试筛选功能**
   - **选择"高"**
     - 点击下拉菜单，选择 **"高"**
     - 点击 **"搜索"** 按钮
     - **验证**：列表应该只显示优先级为"高"的记录
   
   - **选择"中"**
     - 选择 **"中"**
     - 点击 **"搜索"** 按钮
     - **验证**：列表应该只显示优先级为"中"的记录
   
   - **选择"低"**
     - 选择 **"低"**
     - 点击 **"搜索"** 按钮
     - **验证**：列表应该只显示优先级为"低"的记录
   
   - **选择"全部优先级"**
     - 选择 **"全部优先级"**
     - 点击 **"搜索"** 按钮
     - **验证**：列表应该显示所有记录

3. **测试重置功能**
   - 点击 **"重置"** 按钮
   - **验证**：优先级筛选应该重置为"全部优先级"

---

### ✅ 验证点4：表格列筛选

1. **使用列头筛选**
   - 在优先级列的列头，点击筛选图标（漏斗图标）
   - **验证筛选选项**：
     - 应该看到三个选项：高、中、低
   
2. **测试列筛选**
   - 勾选 **"高"**
   - 点击 **"确定"**
   - **验证**：表格应该只显示优先级为"高"的记录

3. **清除筛选**
   - 再次点击列头筛选图标
   - 点击 **"重置"** 或取消勾选
   - **验证**：表格恢复显示所有记录

---

### ✅ 验证点5：优先级排序功能

1. **测试排序**
   - 点击优先级列的列头（标题"优先级"）
   - **验证排序**：
     - 第一次点击：高优先级在前（高 → 中 → 低）
     - 第二次点击：低优先级在前（低 → 中 → 高）
     - 第三次点击：取消排序

---

### ✅ 验证点6：详情 Modal 显示优先级

1. **打开详情**
   - 点击任意记录的 **"查看"** 按钮
   - 打开详情 Modal

2. **验证优先级显示**
   - 在详情 Modal 中查找
   - **验证位置**：优先级应该显示在 **"状态"** 字段旁边
   - **验证格式**：应该显示为带颜色的 Tag
     - 高 = 红色 Tag
     - 中 = 橙色 Tag
     - 低 = 蓝色 Tag

---

### ✅ 验证点7：数据持久化验证

1. **刷新页面**
   - 按 `F5` 或点击浏览器刷新按钮

2. **验证数据保留**
   - **验证优先级显示**：之前设置的优先级应该仍然存在
   - **验证筛选功能**：筛选功能应该仍然正常工作

3. **验证数据库**
   - 回到 Supabase Dashboard
   - 选择测试项目
   - 点击 **"Table Editor"** → **"badcases"**
   - **验证数据**：
     - 应该能看到刚才创建的记录
     - `priority` 字段应该有值（high/medium/low）

---

### ✅ 验证点8：浏览器控制台检查

1. **打开开发者工具**
   - 按 `F12` 或右键点击页面 → **"检查"**
   - 切换到 **"Console"** 标签页

2. **检查错误**
   - **验证**：不应该有红色错误信息
   - **验证**：不应该有关于 `priority` 字段的错误

3. **检查 Supabase 连接**
   - 查看 Console 日志
   - **验证**：应该看到 Supabase URL 指向测试项目（不是生产项目）

---

## 📋 第四步：验证完成检查清单

完成以下所有验证项后，功能即可确认正常：

- [ ] ✅ 数据库 `priority` 字段已添加
- [ ] ✅ 新建表单可以选择优先级（默认值为"中"）
- [ ] ✅ 列表页面显示优先级列（带颜色 Tag）
- [ ] ✅ 优先级筛选功能正常（筛选器 + 列筛选）
- [ ] ✅ 优先级排序功能正常（高优先级在前）
- [ ] ✅ 详情 Modal 显示优先级
- [ ] ✅ 数据持久化正常（刷新后数据保留）
- [ ] ✅ 浏览器控制台无错误
- [ ] ✅ 测试环境与生产环境隔离

---

## 📋 第五步：测试完成后清理

### 5.1 切换回生产环境

```bash
cd /Users/yanglurui/voice-badcase-platform

# 切换回生产环境
./switch-env.sh prod
```

**预期输出：**
```
✅ 已切换到生产环境
```

### 5.2 清理测试数据（可选）

如果你想清理测试数据：

1. **删除测试项目**（推荐）
   - 在 Supabase Dashboard 中选择测试项目
   - Settings → General → Delete Project
   - 确认删除

2. **或者清空测试表数据**
   ```sql
   -- 在测试项目的 SQL Editor 中执行
   TRUNCATE TABLE public.badcases;
   ```

### 5.3 删除测试配置文件（可选）

```bash
# 删除测试配置文件（如果不再需要）
rm .env.local.test
```

---

## 🐛 常见问题排查

### 问题1：切换环境后页面报错

**可能原因**：环境变量未正确加载

**解决方法**：
```bash
# 1. 确认配置文件存在
ls -la .env.local.test

# 2. 确认配置内容正确
cat .env.local.test

# 3. 重启开发服务器
# 按 Ctrl+C 停止服务器，然后重新运行 npm run dev
```

### 问题2：优先级字段不显示

**可能原因**：数据库迁移脚本未执行

**解决方法**：
1. 检查 Supabase 表结构
2. 确认 `priority` 字段是否存在
3. 如果不存在，重新执行 `database/add_priority_column.sql`

### 问题3：筛选功能不工作

**可能原因**：筛选状态未正确更新

**解决方法**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 是否有错误
3. 检查筛选状态是否正确更新
4. 尝试刷新页面

### 问题4：数据未保存到数据库

**可能原因**：Supabase 连接配置错误

**解决方法**：
1. 检查 `.env.local.test` 配置是否正确
2. 确认 Supabase URL 和 Key 格式正确
3. 检查 Supabase 项目是否正常运行
4. 查看浏览器 Console 是否有连接错误

---

## 🎉 验证完成！

如果所有验证项都通过，恭喜！你的"修复优先级"功能已经成功实现并验证通过！

### 下一步

1. **提交代码**（如果还没提交）：
   ```bash
   git add .
   git commit -m "feat: 添加修复优先级选择和筛选功能"
   git push origin feature/priority-filter
   ```

2. **创建 Pull Request**：
   - 访问 GitHub 仓库
   - 创建从 `feature/priority-filter` 到 `main` 的 PR
   - 填写 PR 描述，说明功能变更和测试情况

---

**祝你验证顺利！** 🚀

如有任何问题，随时询问！






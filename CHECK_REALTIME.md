# 🔍 Realtime 功能诊断指南

## 问题：一个浏览器新增 badcase，另一个浏览器没有自动更新

---

## ✅ 检查清单

### 1️⃣ **检查 Supabase Dashboard 中 Realtime 是否启用**

**步骤：**
1. 登录到 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单 **Database** → **Replication**
4. 检查 **badcases** 表是否启用了 Realtime

**如何启用：**
- 在 **Replication** 页面中，找到 `badcases` 表
- 确保 **Realtime** 列有一个绿色的开关（已开启状态）
- 如果是灰色的，点击开关启用它

![Realtime Toggle](https://supabase.com/docs/img/guides/realtime/replication-toggle.png)

---

### 2️⃣ **检查浏览器控制台日志**

打开两个浏览器窗口，都打开你的应用，然后：

**浏览器 A（打开控制台 F12）：**
```
应该看到：
✅ Supabase 客户端已初始化
✅ Realtime 订阅成功
🌐 使用 Supabase 数据库
✅ 从 Supabase 加载了 X 条数据
```

**浏览器 B（也打开控制台 F12）：**
1. 在浏览器 B 中新增一个 badcase
2. 检查浏览器 A 的控制台是否输出：
```
🔔 收到数据库变化: {eventType: 'INSERT', ...}
➕ 新增 Badcase: <id>
```

**如果没有看到这些日志：**
- ❌ Realtime 订阅失败
- ❌ 可能原因见下文

---

### 3️⃣ **检查环境变量**

确认 `.env.local` 文件中有正确的配置：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**验证方法：**
1. 打开浏览器控制台
2. 应该看到：
```
🔍 Supabase 环境变量检查:
VITE_SUPABASE_URL: ✅ 已设置 (https://...)
VITE_SUPABASE_ANON_KEY: ✅ 已设置 (长度: xxx)
```

**如果看到 ❌ 未设置：**
- 检查文件名是否正确：`.env.local`（不是 `.env`）
- 重启开发服务器：`npm run dev`

---

### 4️⃣ **检查 RLS (Row Level Security) 策略**

Supabase Realtime 需要正确的 RLS 策略才能工作。

**在 Supabase Dashboard 中执行：**

```sql
-- 1. 检查当前策略
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'badcases';

-- 2. 如果没有策略或策略不正确，执行以下语句：

-- 删除现有策略（如果有）
DROP POLICY IF EXISTS "Enable read access for all users" ON badcases;
DROP POLICY IF EXISTS "Enable insert access for all users" ON badcases;
DROP POLICY IF EXISTS "Enable update access for all users" ON badcases;
DROP POLICY IF EXISTS "Enable delete access for all users" ON badcases;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON badcases;
DROP POLICY IF EXISTS "Allow all operations for anon users" ON badcases;

-- 创建新的策略（允许所有操作）
CREATE POLICY "Allow all operations for all users" ON badcases
FOR ALL 
USING (true)
WITH CHECK (true);

-- 3. 确保 RLS 是启用的
ALTER TABLE badcases ENABLE ROW LEVEL SECURITY;

-- 4. 验证策略
SELECT * FROM pg_policies WHERE tablename = 'badcases';
```

---

### 5️⃣ **检查 Supabase Realtime 配置**

在 Supabase 客户端代码中，确认配置正确：

**检查 `src/api/supabase.ts`：**

```typescript
export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10  // ✅ 确保有这个配置
    }
  }
});
```

---

### 6️⃣ **使用诊断工具**

我已经创建了一个诊断工具页面，打开它可以实时查看 Realtime 状态。

**使用方法：**
1. 在项目根目录运行开发服务器：`npm run dev`
2. 打开浏览器访问：`http://localhost:5173/realtime-debug.html`
3. 查看 Realtime 连接状态
4. 测试新增/更新/删除操作

---

## 🛠️ 常见问题和解决方案

### ❌ 问题 1：订阅失败 - "CHANNEL_ERROR"

**原因：**
- Supabase Dashboard 中 Realtime 未启用
- RLS 策略阻止了订阅

**解决方案：**
1. 在 Supabase Dashboard → Database → Replication 中启用 `badcases` 表的 Realtime
2. 执行上面的 RLS 策略 SQL

---

### ❌ 问题 2：订阅成功，但收不到事件

**原因：**
- RLS 策略阻止了特定操作
- Realtime 订阅的表名或 schema 不正确

**解决方案：**
1. 检查策略是否允许 SELECT：
```sql
CREATE POLICY "Allow all read" ON badcases
FOR SELECT 
USING (true);
```

2. 确认订阅代码中的表名正确：
```typescript
.on('postgres_changes', {
  event: '*',
  schema: 'public',  // ✅ 确认是 'public'
  table: 'badcases', // ✅ 确认表名正确
}, ...)
```

---

### ❌ 问题 3：本地看到日志，但列表不更新

**原因：**
- React 状态更新问题
- 数据格式不匹配

**解决方案：**
检查 `BadcaseContext.tsx` 中的状态更新逻辑是否正确执行。

---

## 📞 快速测试步骤

### 方法 1：使用测试页面

```bash
# 在项目根目录
cd /Users/ailian/Downloads/voice-badcase-platform
npm run dev
```

然后打开两个浏览器窗口：
- 窗口 1：`http://localhost:5173`
- 窗口 2：`http://localhost:5173`

在窗口 1 新增一个 badcase，看窗口 2 是否自动更新。

### 方法 2：使用 Supabase SQL Editor

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 手动插入一条测试数据
INSERT INTO badcases (
  user_input, expected_output, actual_output, 
  badcase_type, status, priority, source, 
  created_at, updated_at
) VALUES (
  '测试用户输入 - Realtime 测试', 
  '期望输出', 
  '实际输出', 
  'ASR错误', 
  'pending', 
  'high', 
  'manual', 
  NOW(), 
  NOW()
);
```

然后检查浏览器是否立即显示这条新数据。

---

## ✅ 验证成功的标志

当 Realtime 功能正常工作时，你应该看到：

1. **浏览器控制台：**
```
✅ Realtime 订阅成功
🔔 收到数据库变化: {eventType: 'INSERT', ...}
➕ 新增 Badcase: <id>
```

2. **多个浏览器窗口：**
- 在任一窗口操作数据
- 所有窗口**立即**（1-2秒内）同步更新

3. **不需要刷新页面**：
- 所有变化自动显示
- 无需手动刷新

---

## 🚨 如果以上都不行

请执行以下操作并将结果告诉我：

1. **浏览器控制台截图**（显示所有日志）
2. **Supabase Dashboard → Database → Replication 截图**（显示 badcases 表的 Realtime 状态）
3. **执行以下 SQL 并复制结果：**
```sql
SELECT * FROM pg_policies WHERE tablename = 'badcases';
```

我会帮你进一步诊断！


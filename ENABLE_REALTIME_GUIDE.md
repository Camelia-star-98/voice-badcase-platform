# 🚀 Supabase Realtime 启用完整指南

## 📋 目录
1. [什么是 Realtime？](#什么是-realtime)
2. [方法一：通过 Supabase 控制台启用](#方法一通过-supabase-控制台启用)
3. [方法二：通过 SQL 脚本启用](#方法二通过-sql-脚本启用)
4. [验证 Realtime 是否已启用](#验证-realtime-是否已启用)
5. [常见问题排查](#常见问题排查)

---

## 什么是 Realtime？

Supabase Realtime 是一个实时数据同步功能，可以：
- 📡 **实时监听数据库变化** - INSERT、UPDATE、DELETE
- 🔄 **自动同步前端** - 无需手动刷新页面
- 🌐 **多客户端同步** - 多个用户看到相同的数据更新

**示例场景：**
- 用户 A 添加一条 Badcase → 用户 B 的页面自动显示新数据
- 用户 A 修改状态 → 用户 B 的页面自动更新状态

---

## 方法一：通过 Supabase 控制台启用

### 步骤 1: 登录 Supabase

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择你的项目

### 步骤 2: 进入 Database 设置

1. 在左侧菜单中，点击 **"Database"**
2. 选择 **"Replication"** 标签

![Supabase Replication](https://supabase.com/docs/img/guides/database/replication-screenshot.png)

### 步骤 3: 启用表的 Realtime

1. 找到 **"Source"** 部分
2. 在表列表中找到 `badcases` 表
3. 点击表旁边的 **切换开关**，使其变为 **绿色/启用状态**
4. 确认启用

### 步骤 4: 验证

- 启用后，开关应该显示为绿色
- 表名旁边会显示 "Realtime enabled"

---

## 方法二：通过 SQL 脚本启用

### 步骤 1: 打开 SQL 编辑器

1. 在 Supabase 控制台左侧菜单中，点击 **"SQL Editor"**
2. 点击 **"New query"** 创建新查询

### 步骤 2: 运行 SQL 脚本

复制以下 SQL 脚本并运行：

```sql
-- 1. 设置表的 REPLICA IDENTITY 为 FULL
-- 这样可以监听到完整的行变化
ALTER TABLE public.badcases REPLICA IDENTITY FULL;

-- 2. 将表添加到 supabase_realtime publication
-- 这会启用 Realtime 广播
ALTER PUBLICATION supabase_realtime ADD TABLE public.badcases;

-- 3. 验证配置
SELECT 
    schemaname, 
    tablename,
    'Realtime Enabled' AS status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'badcases';
```

### 步骤 3: 查看结果

运行后，应该看到类似输出：

```
schemaname | tablename | status
-----------+-----------+------------------
public     | badcases  | Realtime Enabled
```

---

## 验证 Realtime 是否已启用

### 方法 1: 通过控制台验证

1. 进入 **Database → Replication**
2. 查看 `badcases` 表是否显示为已启用

### 方法 2: 通过 SQL 验证

在 SQL 编辑器中运行：

```sql
-- 检查表是否在 Realtime publication 中
SELECT EXISTS(
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'badcases'
) AS is_realtime_enabled;
```

应该返回 `true`。

### 方法 3: 通过前端验证

1. 打开你的应用（`http://localhost:5173`）
2. 打开浏览器开发者工具（F12）
3. 查看控制台，应该看到：

```
🔔 启动 Supabase Realtime 订阅...
✅ Realtime 订阅成功
```

**测试实时同步：**
1. 打开两个浏览器窗口
2. 在窗口 A 中添加一条 Badcase
3. 在窗口 B 中应该自动显示新数据（无需刷新）

---

## 常见问题排查

### ❌ 问题 1: "Realtime 订阅超时"

**原因：**
- Realtime 未在 Supabase 控制台启用
- 网络连接问题

**解决方案：**
1. 确认已按上述步骤启用 Realtime
2. 检查网络连接
3. 尝试刷新页面

### ❌ 问题 2: "CHANNEL_ERROR"

**原因：**
- 表不存在
- 权限配置错误

**解决方案：**
1. 检查表名是否正确（`badcases`）
2. 运行权限配置脚本：

```sql
-- 授予 anon 和 authenticated 用户读取权限
GRANT SELECT ON public.badcases TO anon, authenticated;
GRANT ALL ON public.badcases TO authenticated;
```

### ❌ 问题 3: "Cannot read properties of undefined"

**原因：**
- Supabase 环境变量未设置

**解决方案：**
1. 检查 `.env.local` 文件是否存在
2. 确认包含：
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. 重启开发服务器

### ❌ 问题 4: 订阅成功但数据不更新

**原因：**
- REPLICA IDENTITY 未设置为 FULL

**解决方案：**
```sql
ALTER TABLE public.badcases REPLICA IDENTITY FULL;
```

---

## 🎯 快速启用脚本

使用我们提供的一键脚本：

```bash
# 在 Supabase SQL 编辑器中运行
cat database/enable_realtime_step_by_step.sql
```

或者直接在项目根目录运行：

```bash
# 如果你有 Supabase CLI
supabase db push database/enable_realtime_step_by_step.sql
```

---

## 📊 测试 Realtime

### 测试步骤：

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **打开两个浏览器窗口**
   - 窗口 A: `http://localhost:5173`
   - 窗口 B: `http://localhost:5173`

3. **在窗口 A 中操作**
   - 添加新的 Badcase
   - 修改现有 Badcase 的状态
   - 删除 Badcase

4. **观察窗口 B**
   - 应该自动显示所有变化
   - 无需刷新页面

### 预期结果：

```
窗口 A: [用户操作] 添加 Badcase "测试数据"
窗口 B: [自动更新] 显示 "测试数据"

窗口 A: [用户操作] 修改状态为 "已验证"
窗口 B: [自动更新] 状态变为 "已验证"
```

---

## 🔧 进阶配置

### 自定义 Realtime 配置

如果需要调整 Realtime 行为，可以修改 `src/api/supabase.ts`：

```typescript
export const supabase = createClient(finalUrl, finalKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,  // 每秒最多接收 10 个事件
    },
    timeout: 30000,  // 超时时间：30 秒
  }
});
```

### 监听特定事件

如果只需要监听特定操作，可以修改 `src/contexts/BadcaseContext.tsx`：

```typescript
// 只监听 INSERT 事件
.on('postgres_changes', {
  event: 'INSERT',  // 改为: 'INSERT', 'UPDATE', 或 'DELETE'
  schema: 'public',
  table: 'badcases',
}, (payload) => {
  // 处理逻辑
})
```

---

## 📚 相关文档

- [Supabase Realtime 官方文档](https://supabase.com/docs/guides/realtime)
- [Postgres Replication 文档](https://supabase.com/docs/guides/database/replication)
- [项目实时同步说明](./数据同步问题解决方案.md)

---

## ✅ 检查清单

完成以下步骤，确保 Realtime 正常工作：

- [ ] 在 Supabase 控制台中启用了 `badcases` 表的 Realtime
- [ ] 运行了 SQL 脚本设置 REPLICA IDENTITY
- [ ] 验证脚本返回 `Realtime Enabled`
- [ ] 浏览器控制台显示 "✅ Realtime 订阅成功"
- [ ] 测试多窗口数据同步成功

---

## 🆘 需要帮助？

如果按照上述步骤仍然无法启用 Realtime：

1. 检查 Supabase 项目是否是免费计划（免费计划有限制）
2. 查看 Supabase 控制台的 **Logs** 页面，寻找错误信息
3. 在浏览器控制台查看详细错误日志
4. 参考 `CHECK_REALTIME.md` 文档进行深度诊断

---

**祝你使用愉快！** 🎉


# 🧪 Realtime 实时同步测试指南

## 快速测试步骤

### 方法 1：双窗口测试（推荐）

1. **打开两个浏览器窗口**
   - 窗口 A：https://voice-badcase-platform.vercel.app/
   - 窗口 B：https://voice-badcase-platform.vercel.app/
   - 并排放置，方便同时观察

2. **测试新增**
   - 在窗口 A 点击"新增 Badcase"
   - 填写信息并保存
   - ✅ **窗口 B 应该立即显示新增的记录**

3. **测试编辑**
   - 在窗口 A 编辑刚才添加的 badcase
   - 修改标题或状态
   - ✅ **窗口 B 应该立即看到更新**

4. **测试删除**
   - 在窗口 A 删除该 badcase
   - ✅ **窗口 B 应该立即看到记录消失**

---

### 方法 2：跨设备测试

1. **电脑**：打开 https://voice-badcase-platform.vercel.app/
2. **手机**：打开同一个链接
3. 在电脑上操作，观察手机端的实时更新

---

### 方法 3：多人协作测试

1. 邀请同事同时访问系统
2. 各自添加 badcase
3. 观察是否能实时看到彼此的操作

---

## 🔍 查看实时日志

### 1. 打开浏览器控制台

- **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: 按 `F12` 或 `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: `Cmd+Option+C`

### 2. 查看 Console 标签页

**成功的日志示例：**

```
🔍 Supabase 环境变量检查:
VITE_SUPABASE_URL: ✅ 已设置
✅ Supabase 客户端已初始化
✅ Supabase 连接成功

🔔 启动 Supabase Realtime 订阅...
✅ Realtime 订阅成功

🔔 收到数据库变化: { eventType: 'INSERT', table: 'badcases' }
➕ 新增 Badcase: BC0001
```

**失败的日志示例：**

```
❌ Realtime 订阅失败: { error: '...' }
```

---

## ⚠️ 如果 Realtime 不工作

### 检查清单

#### 1. Supabase 表是否启用 Realtime？

访问 [Supabase Dashboard](https://app.supabase.com) → Database → Replication

确保 `badcases` 表被勾选。

或在 SQL Editor 执行：

```sql
alter publication supabase_realtime add table badcases;
```

#### 2. 环境变量是否正确？

在控制台应该看到：

```
VITE_SUPABASE_URL: ✅ 已设置
VITE_SUPABASE_ANON_KEY: ✅ 已设置
```

如果显示 `❌ 未设置`，需要配置 `.env.local` 文件。

#### 3. 网络连接是否正常？

检查控制台是否有 WebSocket 连接错误。

#### 4. 清除缓存

```bash
# 清除浏览器缓存后刷新
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

---

## 📊 性能测试

### 延迟测试

1. 在窗口 A 添加 badcase，记录时间
2. 在窗口 B 看到更新，记录时间
3. 计算延迟

**正常延迟**：500ms - 2 秒

**异常延迟**：> 5 秒 → 需要检查网络或 Supabase 状态

### 并发测试

1. 模拟 5-10 个用户同时访问
2. 同时添加 badcase
3. 观察是否所有用户都能看到所有更新

---

## 🎯 验收标准

完成以下所有测试，Realtime 功能即为正常：

- [ ] **双窗口新增测试** - 窗口 A 新增，窗口 B 立即显示
- [ ] **双窗口编辑测试** - 窗口 A 编辑，窗口 B 立即更新
- [ ] **双窗口删除测试** - 窗口 A 删除，窗口 B 立即消失
- [ ] **控制台日志正常** - 显示 "✅ Realtime 订阅成功"
- [ ] **延迟合理** - 更新延迟 < 3 秒
- [ ] **无重复数据** - 不会出现同一条记录显示多次

---

## 🐛 常见问题

### Q1: 控制台显示 "❌ Realtime 订阅失败"

**A**: 检查 Supabase Dashboard 中 `badcases` 表是否启用了 Realtime。

### Q2: 数据有延迟（3-5秒）

**A**: 这是正常的，Supabase 的 Realtime 会有一定延迟。

### Q3: 刷新页面后才能看到更新

**A**: Realtime 订阅可能失败了，检查控制台日志。

### Q4: 有时候能工作，有时候不能

**A**: 可能是网络不稳定，Realtime 会自动重连。

---

## 📸 测试截图建议

测试完成后，建议截图保存：

1. **双窗口并排** - 展示实时同步效果
2. **控制台日志** - 显示订阅成功
3. **Supabase Dashboard** - 显示 Realtime 已启用

---

## ✅ 测试报告模板

```
测试日期: 2025-12-22
测试人员: ______
测试环境: 生产环境 / 本地环境

测试结果:
[ ] 双窗口新增测试 - 通过/失败
[ ] 双窗口编辑测试 - 通过/失败
[ ] 双窗口删除测试 - 通过/失败
[ ] 控制台日志正常 - 通过/失败
[ ] 延迟测试: ___ 毫秒
[ ] 跨设备测试 - 通过/失败

问题记录:
- (如有问题，在此记录)

总结: Realtime 功能 正常/异常
```

---

## 🚀 下一步

测试通过后：

1. ✅ 通知团队 Realtime 功能已上线
2. ✅ 更新用户手册
3. ✅ 开始正式使用多人协作功能
4. ✅ 收集用户反馈

---

需要帮助？查看 `REALTIME_SETUP.md` 获取详细配置说明。


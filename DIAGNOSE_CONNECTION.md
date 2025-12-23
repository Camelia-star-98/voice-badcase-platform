# 🔍 Supabase 连接问题诊断

## 从截图看到的问题

```
❌ HEAD https://bpivzznuvvbafsyvzxqm.supabase.co/rest/v1/badcases?select=count
   net::ERR_NAME_NOT_RESOLVED

❌ Supabase 连接失败: TypeError: Failed to fetch
```

**核心问题**：无法解析 Supabase 域名 → DNS 解析失败

---

## 🚨 紧急检查清单

### 1️⃣ 检查控制台 - 环境变量是否加载？

打开浏览器开发者工具（F12），查看控制台最上面的日志，应该看到：

```
🔍 Supabase 环境变量检查:
VITE_SUPABASE_URL: ✅ 已设置 (https://bpivzznuvvbafsyvzxqm.supabase.co)
VITE_SUPABASE_ANON_KEY: ✅ 已设置 (长度: 218)
✅ Supabase 客户端已初始化
```

**如果看到 `❌ 未设置`**，说明环境变量没有加载！

---

## 🛠️ 解决方案

### 方案 1：创建 `.env.local` 文件（最常见）

1. **在项目根目录**创建文件 `.env.local`
   ```bash
   cd /Users/ailian/Downloads/voice-badcase-platform
   ```

2. **写入以下内容**：
   ```env
   VITE_SUPABASE_URL=https://bpivzznuvvbafsyvzxqm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXZ6em51dnZiYWZzeXZ6eHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDg1NjIsImV4cCI6MjA0ODk4NDU2Mn0.cXDE2rwda9N9o_eBSZeW10_YuVNCN6BCHc0kcNCuTRw
   ```

3. **重启开发服务器**（非常重要！）
   - 停止当前服务器：按 `Ctrl+C`
   - 重新启动：`npm run dev`

4. **刷新浏览器**：`Cmd+Shift+R`

---

### 方案 2：网络问题 - 无法访问 Supabase

如果环境变量已正确设置，但仍然显示 `ERR_NAME_NOT_RESOLVED`，可能是网络问题。

#### 测试 Supabase 连接：

打开终端，执行：
```bash
ping bpivzznuvvbafsyvzxqm.supabase.co
```

或者在浏览器直接访问：
```
https://bpivzznuvvbafsyvzxqm.supabase.co
```

**预期结果**：
- ✅ 能 ping 通或浏览器能访问 → 网络正常
- ❌ 无法访问 → 网络被阻止

#### 可能的网络问题：

1. **防火墙阻止**
   - 检查公司/学校网络是否阻止 Supabase
   - 尝试切换到手机热点

2. **DNS 问题**
   - 尝试切换 DNS 服务器（如 8.8.8.8）
   - 刷新 DNS 缓存：
     ```bash
     sudo dscacheutil -flushcache
     sudo killall -HUP mDNSResponder
     ```

3. **VPN/代理问题**
   - 如果使用 VPN，尝试关闭
   - 如果有代理设置，尝试禁用

---

### 方案 3：验证 Supabase 项目状态

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目：`bpivzznuvvbafsyvzxqm`
3. 检查项目状态：
   - ✅ 绿色：运行正常
   - ⏸️ 暂停：需要恢复项目
   - ❌ 错误：需要处理

**如果项目暂停**：
- Supabase 免费版会在 7 天不活动后暂停
- 点击 "Resume project" 恢复

---

## 📋 快速诊断步骤

按顺序执行：

### Step 1: 检查环境变量

在项目根目录执行：
```bash
cd /Users/ailian/Downloads/voice-badcase-platform
cat .env.local
```

**应该看到**：
```
VITE_SUPABASE_URL=https://bpivzznuvvbafsyvzxqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**如果文件不存在或内容不对**：
```bash
# 创建文件
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://bpivzznuvvbafsyvzxqm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXZ6em51dnZiYWZzeXZ6eHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDg1NjIsImV4cCI6MjA0ODk4NDU2Mn0.cXDE2rwda9N9o_eBSZeW10_YuVNCN6BCHc0kcNCuTRw
EOF
```

### Step 2: 测试网络连接

```bash
# 测试 DNS 解析
nslookup bpivzznuvvbafsyvzxqm.supabase.co

# 测试 HTTP 连接
curl -I https://bpivzznuvvbafsyvzxqm.supabase.co
```

### Step 3: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### Step 4: 清除浏览器缓存并刷新

- Chrome/Edge: `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)
- 或者打开无痕窗口测试

---

## 🎯 根据你的情况判断

### 情况 A：环境变量未设置（最常见）

**症状**：控制台显示 `❌ 未设置`

**解决**：
1. 创建 `.env.local` 文件（见上面方案 1）
2. 重启开发服务器
3. 刷新浏览器

### 情况 B：网络无法访问 Supabase

**症状**：环境变量 ✅，但 `ERR_NAME_NOT_RESOLVED`

**解决**：
1. 测试网络连接（见上面方案 2）
2. 尝试切换网络（手机热点）
3. 检查防火墙/VPN 设置

### 情况 C：Supabase 项目暂停

**症状**：网络正常，但无法连接

**解决**：
1. 登录 Supabase Dashboard
2. 恢复暂停的项目

---

## ✅ 成功的标志

修复后，控制台应该显示：

```
🔍 Supabase 环境变量检查:
VITE_SUPABASE_URL: ✅ 已设置 (https://bpivzznuvvbafsyvzxqm.supabase.co)
VITE_SUPABASE_ANON_KEY: ✅ 已设置 (长度: 218)
✅ Supabase 客户端已初始化
✅ Supabase 连接成功
✅ Realtime 订阅成功
✅ 从 Supabase 加载了 X 条数据
```

**不应该看到**：
- ❌ ERR_NAME_NOT_RESOLVED
- ❌ 使用本地 localStorage
- ❌ Supabase 连接失败

---

## 📞 下一步

请按照上面的步骤检查，然后告诉我：

1. `.env.local` 文件是否存在？内容是什么？
2. 浏览器控制台显示的环境变量状态是什么？（✅ 或 ❌）
3. `ping bpivzznuvvbafsyvzxqm.supabase.co` 的结果是什么？
4. Supabase Dashboard 中项目状态如何？

根据你的回答，我可以给出更精确的解决方案！


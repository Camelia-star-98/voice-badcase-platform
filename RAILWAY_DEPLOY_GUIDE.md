# 🚂 Railway 部署指南 - 解决钉钉访问问题

## 📋 为什么选择 Railway？

Vercel 在某些地区可能被钉钉服务器限制访问，Railway 提供更稳定的解决方案：

- ✅ **香港/新加坡节点** - 钉钉可直接访问
- ✅ **稳定域名** - 不会被限制
- ✅ **简单部署** - 类似 Vercel 体验
- ✅ **免费额度** - $5/月（足够小型应用）

---

## 🚀 部署步骤（5分钟完成）

### 📝 第一步：准备 Railway 账号

1. 访问 **https://railway.app**
2. 点击 **Sign up** 注册（可用 GitHub 登录）
3. 完成邮箱验证

---

### 🔗 第二步：连接 GitHub 仓库

1. 在 Railway 控制台点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 授权 Railway 访问你的 GitHub
4. 选择仓库：`Camelia-star-98/voice-badcase-platform`

---

### ⚙️ 第三步：配置环境变量

在 Railway 项目中点击 **Variables** 标签，添加以下环境变量：

#### Supabase 配置
```bash
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

#### 钉钉机器人配置
```bash
DINGTALK_APP_KEY=你的_app_key
DINGTALK_APP_SECRET=你的_app_secret
DINGTALK_AGENT_ID=你的_agent_id
DINGTALK_CORP_ID=你的_corp_id
DINGTALK_TOKEN=你的_token
DINGTALK_AES_KEY=你的_aes_key
```

#### Node.js 环境
```bash
NODE_ENV=production
PORT=3000
```

💡 **提示**：可以从本地 `.env` 文件复制对应的值

---

### 🌐 第四步：获取域名

1. 部署完成后，Railway 会自动分配一个域名
2. 格式类似：`https://your-project-name.up.railway.app`
3. 点击 **Settings** → **Domains** 查看完整域名
4. **复制这个域名**（后面需要用）

---

### 🔧 第五步：配置钉钉回调地址

1. 登录 **钉钉开发者后台**：https://open-dev.dingtalk.com
2. 进入你的应用 → **开发管理** → **事件订阅**
3. 更新回调 URL 为：
   ```
   https://你的railway域名.up.railway.app/api/dingtalk-bot
   ```
   
4. 点击 **保存** 并等待验证
5. 看到 ✅ **验证成功** 即可

---

## 📊 部署架构

```
┌─────────────┐
│  钉钉服务器  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│  Railway (香港节点)          │
│  ├─ 前端 (React + Vite)     │
│  ├─ API (/api/dingtalk-bot) │
│  └─ Express 服务器           │
└──────┬──────────────────────┘
       │ API Calls
       ▼
┌─────────────┐
│  Supabase   │
│  (数据库)    │
└─────────────┘
```

---

## 🧪 测试部署

### 1️⃣ 测试健康检查

访问：`https://你的railway域名.up.railway.app/health`

**期望返回：**
```json
{
  "status": "ok",
  "timestamp": "2024-12-25T12:00:00.000Z",
  "config": {
    "hasSupabase": true,
    "hasDingTalk": true,
    "hasCrypto": true
  }
}
```

### 2️⃣ 测试钉钉回调

访问：`https://你的railway域名.up.railway.app/api/dingtalk-bot`

**期望返回：**
```json
{
  "message": "DingTalk bot endpoint is ready",
  "config": {
    "hasToken": true,
    "hasAESKey": true,
    "hasCorpId": true,
    "hasCryptoHelper": true
  }
}
```

### 3️⃣ 测试钉钉提交

在钉钉应用中：
1. 发送 `@机器人 提报问题`
2. 应该收到模板消息
3. 填写完整后再发送
4. 应该收到成功确认

---

## 🔍 查看日志

Railway 提供实时日志查看：

1. 在项目页面点击 **Deployments**
2. 选择当前部署
3. 点击 **View Logs**
4. 可以看到实时请求日志

**关键日志：**
```
✅ 加密工具初始化成功
🚀 服务器启动成功！
📍 监听端口: 3000
✅ Supabase: 已配置
✅ 钉钉: 已配置
```

---

## ⚠️ 常见问题

### 1. 部署失败？

**检查步骤：**
- ✅ 确认 `Dockerfile` 存在
- ✅ 检查 `package.json` 中有 `"start"` 脚本
- ✅ 查看 Railway 部署日志

**解决方法：**
```bash
# 本地测试 Dockerfile
docker build -t test-app .
docker run -p 3000:3000 test-app
```

### 2. 钉钉回调验证失败？

**检查清单：**
- ✅ URL 格式正确（包含 `https://`）
- ✅ 环境变量 `DINGTALK_TOKEN`、`DINGTALK_AES_KEY`、`DINGTALK_CORP_ID` 已设置
- ✅ 查看 Railway 日志是否有错误

### 3. 数据库连接失败？

**检查环境变量：**
```bash
# 确认这两个变量正确
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. 502 Bad Gateway？

**原因：** 服务器启动失败

**解决步骤：**
1. 检查 Railway 日志
2. 确认 `PORT` 环境变量 = `3000`
3. 确认 Express 监听 `process.env.PORT`

---

## 💰 费用说明

Railway 免费额度：
- 💵 **$5 免费额度/月**
- 🕐 **500 小时运行时间/月**（约等于 24/7 运行 20 天）
- 📦 **100GB 带宽/月**

**预估消耗：**
- 小型应用（< 100 次/天）：**~$2-3/月**
- 中型应用（100-1000 次/天）：**~$5/月**

💡 **提示**：如果超出免费额度，Railway 会自动暂停服务（不会扣费）

---

## 🔄 更新代码

**方式1：自动部署（推荐）**
```bash
# 推送到 GitHub 后自动部署
git add .
git commit -m "更新代码"
git push origin main
```

Railway 会自动检测 GitHub 更新并重新部署。

**方式2：手动触发**
1. 在 Railway 项目页面
2. 点击 **Deployments** → **Deploy Now**

---

## 📚 相关文档

- Railway 官方文档：https://docs.railway.app
- 钉钉回调文档：https://open.dingtalk.com/document/development/http-callback-overview
- Supabase 文档：https://supabase.com/docs

---

## 🆘 需要帮助？

如果遇到问题：

1. 📋 查看 Railway 日志
2. 🔍 检查环境变量配置
3. 🧪 使用 `/health` 端点测试
4. 💬 在项目 README 中提 Issue

---

## ✅ 部署完成清单

- [ ] Railway 账号创建完成
- [ ] GitHub 仓库连接成功
- [ ] 环境变量全部配置
- [ ] 部署成功并获得域名
- [ ] `/health` 端点测试通过
- [ ] `/api/dingtalk-bot` 端点测试通过
- [ ] 钉钉回调 URL 更新完成
- [ ] 钉钉回调验证通过
- [ ] 在钉钉中测试提交成功

---

## 🎉 恭喜！

你的 Badcase 平台现在已经部署在 Railway 上，钉钉可以稳定访问了！

**后续优化建议：**
- 🌐 绑定自定义域名（可选）
- 📊 设置监控告警
- 🔐 启用 HTTPS 强制（Railway 默认支持）
- 💾 定期备份 Supabase 数据

祝使用愉快！🚀


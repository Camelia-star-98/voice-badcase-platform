# 🚀 部署方案对比 - Vercel vs Railway

## 🎯 你的问题：钉钉无法访问 Vercel

### 症状
- ✅ Vercel 部署成功
- ❌ 钉钉回调验证失败
- ❌ 钉钉服务器无法访问你的 Vercel 域名

---

## 📊 方案对比

| 特性 | Vercel | Railway |
|------|--------|---------|
| **钉钉访问** | ❌ 可能被限制 | ✅ 稳定可访问 |
| **部署难度** | ⭐⭐⭐⭐⭐ 极简 | ⭐⭐⭐⭐ 简单 |
| **配置文件** | `vercel.json` | `Dockerfile` + `railway.json` |
| **节点位置** | 香港/新加坡 | 香港/新加坡 |
| **域名** | `.vercel.app` | `.up.railway.app` |
| **免费额度** | 100GB 带宽 | $5/月（约 500 小时）|
| **适用场景** | 静态站 + Serverless | 全栈应用 + API |
| **日志查看** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ 实时详细 |

---

## ✅ 推荐方案：Railway

### 为什么？

1. **网络访问稳定**
   - ✅ 钉钉服务器可直接访问
   - ✅ 不受防火墙限制
   - ✅ 企业网络友好

2. **架构更适合**
   - ✅ Express 服务器（统一处理前后端）
   - ✅ 长连接支持更好
   - ✅ 日志更详细

3. **调试更方便**
   - ✅ 实时日志查看
   - ✅ 完整的 Node.js 环境
   - ✅ 支持 SSH 连接

---

## 🚀 快速开始 Railway 部署

### 📝 已为你准备好的文件

我已经创建了以下配置文件：

```
voice-badcase-platform/
├── Dockerfile                    # ✅ Docker 镜像配置
├── .dockerignore                 # ✅ Docker 忽略文件
├── railway.json                  # ✅ Railway 配置
├── server/railway-server.js      # ✅ Express 服务器
├── package.json                  # ✅ 已添加 express 依赖
└── RAILWAY_DEPLOY_GUIDE.md       # ✅ 详细部署指南
```

### ⚡ 5 分钟部署流程

```bash
# 1. 安装新依赖
npm install

# 2. 提交代码到 GitHub
git add .
git commit -m "添加 Railway 部署配置"
git push origin main

# 3. 访问 Railway 并部署
# https://railway.app
# → New Project → Deploy from GitHub → 选择你的仓库
```

---

## 🔄 从 Vercel 迁移到 Railway

### 不需要改动的部分
- ✅ 前端代码（React + Vite）
- ✅ 数据库（Supabase）
- ✅ 钉钉机器人逻辑
- ✅ 环境变量名称

### 需要改动的部分
- 📝 部署平台：Vercel → Railway
- 📝 回调 URL：`xxx.vercel.app` → `xxx.up.railway.app`

---

## 📋 迁移步骤（详细版）

### 第 1 步：安装依赖
```bash
cd /Users/ailian/Downloads/voice-badcase-platform
npm install
```

### 第 2 步：提交到 GitHub
```bash
git add .
git commit -m "添加 Railway 部署配置"
git push origin main
```

### 第 3 步：部署到 Railway

1. **注册 Railway**
   - 访问：https://railway.app
   - 用 GitHub 账号登录

2. **创建项目**
   - 点击 **New Project**
   - 选择 **Deploy from GitHub repo**
   - 选择 `Camelia-star-98/voice-badcase-platform`

3. **配置环境变量**
   
   点击 **Variables**，添加以下变量：
   
   ```bash
   # Supabase
   VITE_SUPABASE_URL=你的_supabase_url
   VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
   
   # 钉钉
   DINGTALK_APP_KEY=你的_app_key
   DINGTALK_APP_SECRET=你的_app_secret
   DINGTALK_AGENT_ID=你的_agent_id
   DINGTALK_CORP_ID=你的_corp_id
   DINGTALK_TOKEN=你的_token
   DINGTALK_AES_KEY=你的_aes_key
   
   # 环境
   NODE_ENV=production
   PORT=3000
   ```

4. **等待部署**
   - Railway 自动检测 `Dockerfile`
   - 自动构建并部署
   - 约 3-5 分钟完成

5. **获取域名**
   - 点击 **Settings** → **Domains**
   - 复制域名（如：`https://voice-badcase-platform.up.railway.app`）

### 第 4 步：更新钉钉回调

1. 登录钉钉开发者后台：https://open-dev.dingtalk.com
2. 进入应用 → **事件订阅**
3. 更新回调 URL：
   ```
   https://你的railway域名.up.railway.app/api/dingtalk-bot
   ```
4. 保存并验证

### 第 5 步：测试

在钉钉中发送：
```
@机器人 提报问题
```

应该收到模板消息！

---

## 🧪 测试端点

部署完成后，测试以下 URL：

### 1. 健康检查
```
https://你的railway域名.up.railway.app/health
```
**期望返回：**
```json
{
  "status": "ok",
  "config": {
    "hasSupabase": true,
    "hasDingTalk": true,
    "hasCrypto": true
  }
}
```

### 2. 钉钉端点
```
https://你的railway域名.up.railway.app/api/dingtalk-bot
```
**期望返回：**
```json
{
  "message": "DingTalk bot endpoint is ready",
  "config": {
    "hasToken": true,
    "hasAESKey": true,
    "hasCorpId": true
  }
}
```

---

## 🔍 调试工具

### 查看实时日志
1. Railway 项目页面
2. 点击 **Deployments**
3. 选择当前部署
4. 点击 **View Logs**

### 关键日志示例
```
✅ 加密工具初始化成功
🚀 服务器启动成功！
📍 监听端口: 3000
[2024-12-25T12:00:00.000Z] POST /api/dingtalk-bot
✅ 解密成功
✅ 返回加密响应
处理完成，耗时: 45ms
```

---

## ❓ 常见问题

### Q1: Railway 要收费吗？
**A:** 免费额度 $5/月，小型应用足够用。超出后会暂停服务（不会扣费）。

### Q2: Vercel 的部署还能用吗？
**A:** 可以保留作为前端备用，但钉钉回调建议用 Railway。

### Q3: 需要删除 Vercel 部署吗？
**A:** 不需要，可以同时保留两个部署。

### Q4: 部署失败怎么办？
**A:** 
1. 检查 Railway 日志
2. 确认 `Dockerfile` 存在
3. 确认环境变量正确

---

## 📚 相关文档

- 📖 **详细部署指南**：`RAILWAY_DEPLOY_GUIDE.md`
- 🔗 Railway 官方文档：https://docs.railway.app
- 🔗 钉钉回调文档：https://open.dingtalk.com/document/development/http-callback-overview

---

## ✅ 总结

### Vercel 问题
- ❌ 钉钉无法访问
- ❌ Serverless 限制
- ❌ 调试困难

### Railway 优势
- ✅ 钉钉稳定访问
- ✅ 全栈支持更好
- ✅ 日志详细清晰
- ✅ 部署配置已就绪

### 下一步
```bash
1. npm install              # 安装依赖
2. git push                # 推送代码
3. 部署到 Railway           # 按照 RAILWAY_DEPLOY_GUIDE.md 操作
4. 更新钉钉回调 URL         # 使用新的 Railway 域名
5. 测试钉钉提交             # 发送 @机器人 提报问题
```

---

**准备好了就开始吧！🚀**

有问题随时问我！


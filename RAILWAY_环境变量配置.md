# 🔐 Railway 环境变量配置指南

> **💡 好消息**：服务器已修复！现在即使没有配置环境变量，服务器也能正常启动。

---

## 📍 配置位置

**Railway 项目页面** → 点击 **Variables** 标签 → 点击 **Add Variable** 添加

---

## ✅ 最小配置（2 个变量即可启动）

### 1. `VITE_SUPABASE_URL` ⭐ 必需
```
你的 Supabase 项目 URL
格式：https://xxxxx.supabase.co
```

### 2. `VITE_SUPABASE_ANON_KEY` ⭐ 必需
```
你的 Supabase Anon Key
格式：eyJhbGci... (很长的 JWT token)
```

**🔍 如何获取：**
1. 打开 https://supabase.com/dashboard
2. 选择你的项目 `voice-badcase-platform`
3. 左侧菜单：**Settings** → **API**
4. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

配置这 2 个变量后，服务器就能正常运行，数据库功能可用！✅

---

## 🤖 钉钉机器人配置（可选，5 个变量）

如果你需要钉钉机器人提报 Badcase 的功能，再添加这些：

### 3. `VITE_DINGTALK_APP_KEY`
```
钉钉 AppKey
```

### 4. `VITE_DINGTALK_APP_SECRET`
```
钉钉 AppSecret
```

### 5. `VITE_DINGTALK_AGENT_ID`
```
钉钉 AgentId
```

### 6. `VITE_DINGTALK_CORP_ID`
```
钉钉企业 ID (CorpId)
```

### 7. `VITE_DINGTALK_ENCODING_AES_KEY`
```
钉钉加密密钥 (EncodingAESKey)
```

**🔍 如何获取：**
1. 登录钉钉开发者后台：https://open-dev.dingtalk.com
2. 选择你的应用
3. **开发管理** → **基础信息**：复制 AppKey、AppSecret、AgentId
4. **开发管理** → **事件与回调**：复制 Token、EncodingAESKey
5. **企业管理**：获取 CorpId

---

## 🚀 配置后的验证

### 1. 保存变量
添加完所有变量后，Railway 会自动重新部署（约 2-3 分钟）

### 2. 查看部署状态
Railway 项目页面 → **Deployments** 标签 → 点击最新部署 → **View Logs**

### 3. 检查日志（应该看到）
```
Node.js v18.20.8
✅ Supabase 客户端初始化成功
✅ 加密工具初始化成功
🚀 服务器启动成功！
📍 监听端口: 3000
🌐 环境: production
✅ Supabase: 已配置
✅ 钉钉: 已配置
```

### 4. 访问健康检查
打开浏览器访问：
```
https://你的railway域名.up.railway.app/health
```

**期望返回：**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T11:32:34.567Z",
  "config": {
    "hasSupabase": true,
    "hasDingTalk": true,
    "hasCrypto": true
  }
}
```

---

## 📊 配置清单总结

| 变量名 | 是否必需 | 说明 |
|--------|---------|------|
| `VITE_SUPABASE_URL` | ✅ 必需 | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ 必需 | Supabase 公共 Key |
| `VITE_DINGTALK_APP_KEY` | 🟡 可选 | 钉钉 AppKey |
| `VITE_DINGTALK_APP_SECRET` | 🟡 可选 | 钉钉 AppSecret |
| `VITE_DINGTALK_AGENT_ID` | 🟡 可选 | 钉钉 AgentId |
| `VITE_DINGTALK_CORP_ID` | 🟡 可选 | 钉钉企业 ID |
| `VITE_DINGTALK_ENCODING_AES_KEY` | 🟡 可选 | 钉钉加密密钥 |

**总共：2 个必需 + 5 个可选 = 7 个环境变量**

---

## 💡 环境变量命名说明

服务器支持多种变量名格式（带或不带 `VITE_` 前缀），例如：

- `VITE_SUPABASE_URL` 或 `SUPABASE_URL` ✅ 都支持
- `VITE_DINGTALK_APP_KEY` 或 `DINGTALK_APP_KEY` ✅ 都支持

**推荐使用 `VITE_` 前缀**，这样前端构建时也能访问这些变量。

---

## 🆘 遇到问题？

### ❌ 服务器启动失败
**检查：**
- 确保 `VITE_SUPABASE_URL` 格式正确（必须以 `https://` 开头，以 `.supabase.co` 结尾）
- 确保 `VITE_SUPABASE_ANON_KEY` 是完整的 JWT token（通常以 `eyJ` 开头）
- 查看 Railway 部署日志，搜索错误信息

### ⚠️ 钉钉机器人不工作
**检查：**
- 确保所有 5 个钉钉变量都已配置
- 检查钉钉开发者后台的回调 URL 是否正确设置为：
  ```
  https://你的railway域名.up.railway.app/api/dingtalk-bot
  ```
- 查看 `/health` 端点，确认 `hasCrypto: true`

### 🔄 修改变量后没生效
**操作：**
1. 确认变量已保存
2. Railway 会自动重新部署，等待 2-3 分钟
3. 刷新浏览器清除缓存

---

## 📚 相关文档

- [Supabase 完整配置](./SUPABASE_SETUP.md)
- [钉钉机器人快速开始](./DINGTALK_QUICKSTART.md)
- [Dockerfile 说明](./Dockerfile)

---

**🎉 配置完成后，你的 Badcase 平台就可以正常使用了！**

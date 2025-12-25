# 🚀 Vercel 部署指南（香港区域）

## 第一步：导入 GitHub 仓库

1. 访问：https://vercel.com/new
2. 使用 GitHub 账号登录
3. 找到你的仓库：`voice-badcase-platform`
4. 点击 **Import**

---

## 第二步：配置项目

Vercel 会自动检测到你的 `vercel.json` 配置，包括：
- ✅ 香港区域 (hkg1)
- ✅ 新加坡备用 (sin1)
- ✅ API 路由配置

**无需修改任何配置**，直接下一步！

---

## 第三步：添加环境变量 ⚠️ 重要！

在 **Environment Variables** 部分添加以下变量：

### Supabase 配置
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

### 钉钉配置
```
DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_AGENT_ID=你的AgentID
DINGTALK_CORP_ID=你的CorpID
DINGTALK_TOKEN=你的加密Token
DINGTALK_AES_KEY=你的数据加密密钥
```

💡 **提示**：这些值可以从你本地的 `.env` 文件中复制

---

## 第四步：部署

1. 点击 **Deploy** 按钮
2. 等待 2-3 分钟
3. 部署成功后会得到一个域名，例如：
   ```
   https://voice-badcase-platform.vercel.app
   ```

---

## 第五步：配置钉钉回调地址

1. 登录钉钉开发者后台：https://open-dev.dingtalk.com
2. 找到你的应用
3. 更新 **服务器出口IP** 和 **回调URL**：
   ```
   回调URL: https://你的域名.vercel.app/api/dingtalk-bot
   ```
4. 保存配置

---

## 第六步：测试

### 测试 API 是否正常
```bash
curl https://你的域名.vercel.app/api/dingtalk-bot
```

应该返回：
```json
{"message":"钉钉机器人接口正常运行"}
```

### 测试钉钉回调
在钉钉群里 @机器人 发送消息，查看是否有响应

---

## 🎉 完成！

你的应用现在运行在 **香港区域**，钉钉回调延迟应该在 50-200ms 之间！

---

## 🔧 后续维护

### 自动部署
每次你推送代码到 GitHub：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel 会自动重新部署，无需手动操作！

### 查看日志
访问：https://vercel.com/dashboard
- 查看部署日志
- 监控函数调用
- 查看错误信息

### 绑定自定义域名（可选）
1. 在 Vercel 项目设置中点击 **Domains**
2. 添加你的域名
3. 按提示配置 DNS

---

## ⚠️ 常见问题

### 1. 部署成功但 API 报错？
检查环境变量是否正确设置

### 2. 钉钉回调超时？
- 检查 Vercel 函数是否部署到香港区域
- 在 Vercel 项目设置中确认 regions 配置

### 3. 环境变量不生效？
- 确保变量名完全一致（区分大小写）
- 重新部署项目（Settings → Deployments → Redeploy）

---

祝部署顺利！🎊


# 🚀 立即部署到 Vercel

## 📋 部署前检查清单

✅ 代码已推送到 GitHub main 分支  
✅ 项目配置文件 `vercel.json` 已存在  
✅ 已有 Vercel 账号（没有的话去 https://vercel.com 注册）

---

## 🎯 部署步骤（5分钟完成）

### 第一步：访问 Vercel

打开浏览器，访问：**https://vercel.com/new**

### 第二步：导入 GitHub 仓库

1. 点击 **"Import Git Repository"**
2. 选择你的 GitHub 账号
3. 找到仓库：`voice-badcase-platform`
4. 点击 **"Import"** 按钮

### 第三步：配置项目

Vercel 会自动检测到配置：

```
✅ Framework Preset: Vite
✅ Build Command: npm run build
✅ Output Directory: dist
✅ Install Command: npm install
```

**不需要修改任何配置！** 直接点击下一步。

### 第四步：添加环境变量 ⚠️ 重要！

点击 **"Environment Variables"**，添加以下变量：

#### Supabase 配置（必需）
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

#### 钉钉配置（必需）
```
DINGTALK_APP_KEY=你的钉钉AppKey
DINGTALK_APP_SECRET=你的钉钉AppSecret
DINGTALK_AGENT_ID=你的AgentID
DINGTALK_CORP_ID=你的CorpID
DINGTALK_TOKEN=你的加密Token
DINGTALK_AES_KEY=你的数据加密密钥
```

> 💡 **提示**：如果不知道这些值，请：
> 1. 查看团队文档
> 2. 联系项目管理员
> 3. 或查看现有的部署环境变量

### 第五步：开始部署

1. 点击 **"Deploy"** 按钮
2. 等待 2-3 分钟（可以看到实时构建日志）
3. 部署成功！🎉

---

## 🌐 部署成功后

你会得到一个域名，类似：
```
https://voice-badcase-platform.vercel.app
```

### 测试部署

#### 1. 测试主页
访问：`https://你的域名.vercel.app`

应该看到平台首页

#### 2. 测试 API
```bash
curl https://你的域名.vercel.app/api/dingtalk-bot
```

应该返回：
```json
{"message":"钉钉机器人接口正常运行"}
```

#### 3. 测试钉钉回调（如果已配置）
在钉钉群里 @机器人 发送消息

---

## 🔧 配置钉钉回调地址

部署成功后，需要更新钉钉开发者后台的配置：

1. 登录：https://open-dev.dingtalk.com
2. 找到你的应用
3. 更新**回调 URL**：
   ```
   https://你的域名.vercel.app/api/dingtalk-bot
   ```
4. 更新**Webhook URL**（如果需要）：
   ```
   https://你的域名.vercel.app/api/dingtalk-webhook
   ```
5. 保存配置
6. 测试回调

---

## 🔄 自动部署

每次你推送代码到 GitHub：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel 会自动检测并重新部署！无需任何手动操作！

---

## 📊 查看部署状态

### Vercel Dashboard
访问：https://vercel.com/dashboard

可以看到：
- ✅ 部署历史
- ✅ 构建日志
- ✅ 函数调用统计
- ✅ 错误日志
- ✅ 性能监控

### 实时日志
在部署页面点击 **"Functions"** → 选择函数 → 查看实时日志

---

## ⚙️ 高级配置（可选）

### 绑定自定义域名

1. 在 Vercel 项目中点击 **"Settings"** → **"Domains"**
2. 点击 **"Add"**
3. 输入你的域名（如：`badcase.yourdomain.com`）
4. 按提示配置 DNS：
   - 类型：CNAME
   - 名称：badcase（或 @）
   - 值：cname.vercel-dns.com
5. 等待 DNS 生效（通常几分钟）

### 配置区域（已自动配置）

项目已配置香港和新加坡区域（在 `vercel.json` 中）：
```json
"regions": ["hkg1", "sin1"]
```

确保低延迟的钉钉回调响应！

### 环境变量管理

- **开发环境**：在 `.env.local` 中配置
- **生产环境**：在 Vercel Dashboard 中配置
- **预览环境**：可以单独配置预览环境变量

---

## ❌ 常见问题

### 1. 部署成功但页面空白？
**原因**：构建失败或路径错误  
**解决**：
- 检查 Vercel 构建日志
- 确认 `dist` 目录生成成功
- 检查浏览器控制台错误

### 2. API 返回 500 错误？
**原因**：环境变量未配置  
**解决**：
- 进入 Vercel → Settings → Environment Variables
- 检查所有变量是否正确设置
- 注意变量名大小写
- 重新部署：Deployments → Redeploy

### 3. 钉钉回调超时？
**原因**：服务器区域不对或函数冷启动  
**解决**：
- 确认 `vercel.json` 中配置了香港区域
- 检查函数 maxDuration 设置
- 优化函数代码，减少冷启动时间

### 4. 环境变量不生效？
**原因**：需要重新部署  
**解决**：
- 修改环境变量后必须重新部署
- Settings → Environment Variables → 编辑
- Deployments → 最新部署 → Redeploy

### 5. 构建失败？
**原因**：依赖问题或代码错误  
**解决**：
```bash
# 本地测试构建
npm run build

# 检查是否有错误
npm run lint
```

### 6. 域名访问慢？
**原因**：DNS 未生效或 CDN 缓存  
**解决**：
- 等待 DNS 完全生效（最多 24 小时）
- 清除浏览器缓存
- 使用 CDN 加速

---

## 🎯 部署完成检查清单

部署成功后，确认以下功能正常：

- [ ] ✅ 主页可以正常访问
- [ ] ✅ 可以查看 Badcase 列表
- [ ] ✅ 可以创建新的 Badcase
- [ ] ✅ 可以编辑和删除 Badcase
- [ ] ✅ 数据可视化图表正常显示
- [ ] ✅ 钉钉机器人回调正常工作
- [ ] ✅ 钉钉 Webhook 接收消息正常
- [ ] ✅ 状态流转功能正常
- [ ] ✅ Excel 导入功能正常

---

## 📞 需要帮助？

- 📘 查看 [Vercel 部署指南](./VERCEL_DEPLOY_GUIDE.md)
- 📘 查看 [钉钉部署清单](./DINGTALK_DEPLOYMENT_CHECKLIST.md)
- 📘 查看 [快速入门指南](./QUICKSTART.md)
- 🤝 联系项目管理员
- 📧 Vercel 技术支持：https://vercel.com/support

---

## 🎉 恭喜！

你的应用现在已经正式上线了！

**下一步**：
1. 将部署链接分享给团队成员
2. 配置钉钉机器人回调地址
3. 测试所有功能是否正常
4. 开始使用！

---

**部署时间**：2026-01-13  
**版本**：v1.0.0  
**状态**：✅ 生产环境


# 🔐 Railway 环境变量配置 - 完整清单

## 📋 配置位置

Railway 项目 → 点击 **Variables** 标签 → 逐个添加以下变量

---

## 1️⃣ Supabase 数据库配置（2个）

### `VITE_SUPABASE_URL`
```
请填写你的 Supabase URL
格式：https://xxxxx.supabase.co
```

### `VITE_SUPABASE_ANON_KEY`
```
请填写你的 Supabase Anon Key
格式：eyJhbGci... (很长的JWT token)
```

**📝 获取方式：**
1. 登录 https://supabase.com/dashboard
2. 选择项目 → **Settings** → **API**
3. 复制 **Project URL** 和 **anon public** key

---

## 2️⃣ 钉钉机器人配置（6个）

### `DINGTALK_APP_KEY`
```
请填写你的钉钉 AppKey
从钉钉开发者后台获取
```

### `DINGTALK_APP_SECRET`
```
请填写你的钉钉 AppSecret
从钉钉开发者后台获取
```

### `DINGTALK_AGENT_ID`
```
请填写你的钉钉 AgentId
从钉钉开发者后台获取
```

### `DINGTALK_CORP_ID`
```
请填写你的钉钉 CorpId
从钉钉开发者后台 → 机器人配置 → 加密配置获取
```

### `DINGTALK_TOKEN`
```
请填写你的钉钉 Token
从钉钉开发者后台 → 机器人配置 → 加密配置获取
```

### `DINGTALK_AES_KEY`
```
请填写你的钉钉 EncodingAESKey
从钉钉开发者后台 → 机器人配置 → 加密配置获取
注意：这是一个43位的字符串
```

**📝 获取方式：**
1. 登录 https://open-dev.dingtalk.com
2. 进入你的应用
3. **基本信息** 页面获取：
   - AppKey
   - AppSecret
   - AgentId
4. **机器人与消息推送** 页面获取：
   - CorpId
   - Token
   - EncodingAESKey（AES Key）

---

## 3️⃣ Node.js 运行环境（2个）

### `NODE_ENV`
```
production
```

### `PORT`
```
3000
```

---

## 📊 完整配置清单（10个变量）

| 序号 | 变量名 | 值 | 来源 |
|------|--------|-----|------|
| 1 | `VITE_SUPABASE_URL` | 你的值 | Supabase Dashboard |
| 2 | `VITE_SUPABASE_ANON_KEY` | 你的值 | Supabase Dashboard |
| 3 | `DINGTALK_APP_KEY` | 你的值 | 钉钉开发者后台 |
| 4 | `DINGTALK_APP_SECRET` | 你的值 | 钉钉开发者后台 |
| 5 | `DINGTALK_AGENT_ID` | 你的值 | 钉钉开发者后台 |
| 6 | `DINGTALK_CORP_ID` | 你的值 | 钉钉机器人配置 |
| 7 | `DINGTALK_TOKEN` | 你的值 | 钉钉机器人配置 |
| 8 | `DINGTALK_AES_KEY` | 你的值 | 钉钉机器人配置 |
| 9 | `NODE_ENV` | `production` | 固定值 |
| 10 | `PORT` | `3000` | 固定值 |

---

## 🎯 配置步骤（逐步操作）

### 第 1 步：打开 Railway 项目
1. 访问 https://railway.app
2. 进入你的项目：`voice-badcase-platform`
3. 点击顶部的 **Variables** 标签

### 第 2 步：添加 Supabase 变量

**添加第 1 个变量：**
- Variable name: `VITE_SUPABASE_URL`
- Value: `你的 Supabase URL`（从 Supabase Dashboard 复制）
- 点击 **Add**

**添加第 2 个变量：**
- Variable name: `VITE_SUPABASE_ANON_KEY`
- Value: `你的 Supabase Anon Key`（从 Supabase Dashboard 复制）
- 点击 **Add**

### 第 3 步：添加钉钉变量

**依次添加以下 6 个变量：**

1. Variable name: `DINGTALK_APP_KEY`
   - Value: `从钉钉后台复制`

2. Variable name: `DINGTALK_APP_SECRET`
   - Value: `从钉钉后台复制`

3. Variable name: `DINGTALK_AGENT_ID`
   - Value: `从钉钉后台复制`

4. Variable name: `DINGTALK_CORP_ID`
   - Value: `从钉钉机器人配置复制`

5. Variable name: `DINGTALK_TOKEN`
   - Value: `从钉钉机器人配置复制`

6. Variable name: `DINGTALK_AES_KEY`
   - Value: `从钉钉机器人配置复制`（43位字符）

### 第 4 步：添加运行环境变量

**添加第 9 个变量：**
- Variable name: `NODE_ENV`
- Value: `production`
- 点击 **Add**

**添加第 10 个变量：**
- Variable name: `PORT`
- Value: `3000`
- 点击 **Add**

### 第 5 步：保存并等待重新部署

✅ Railway 会自动检测到环境变量变化
✅ 自动触发重新部署
✅ 约 2-3 分钟完成

---

## 🔍 如何验证配置正确？

### 方法 1：访问健康检查端点

部署完成后访问：
```
https://你的railway域名.up.railway.app/health
```

**期望看到：**
```json
{
  "status": "ok",
  "timestamp": "2024-12-25T12:00:00.000Z",
  "config": {
    "hasSupabase": true,      // ✅ 应该是 true
    "hasDingTalk": true,      // ✅ 应该是 true
    "hasCrypto": true         // ✅ 应该是 true
  }
}
```

### 方法 2：查看 Railway 日志

1. 在 Railway 项目页面点击 **Deployments**
2. 选择最新的部署
3. 点击 **View Logs**
4. 查找以下日志：

```
✅ 加密工具初始化成功
🚀 服务器启动成功！
📍 监听端口: 3000
✅ Supabase: 已配置
✅ 钉钉: 已配置
```

---

## ⚠️ 常见配置错误

### 错误 1：环境变量名称拼写错误

❌ **错误示例：**
- `VITE_SUPABASE_URl`（少了一个L）
- `DINGTALK_TOKEN_`（多了下划线）
- `dingtalk_app_key`（小写，应该全大写）

✅ **正确做法：**
- 完全按照上面清单复制粘贴变量名
- 变量名区分大小写
- 不要有多余的空格

### 错误 2：环境变量值有空格

❌ **错误示例：**
```
VITE_SUPABASE_URL = https://xxx.supabase.co
（注意等号两边有空格）
```

✅ **正确做法：**
- Railway 会自动处理，但建议值前后不要有空格
- 直接从源头复制，不要手动输入

### 错误 3：AES Key 不是 43 位

❌ **错误：**
- 复制时少了字符
- 复制时多了换行符

✅ **正确做法：**
- 确认 `DINGTALK_AES_KEY` 长度正好是 43 位
- 从钉钉后台直接复制，不要手动编辑

---

## 📝 配置来源参考

### Supabase 配置位置

```
Supabase Dashboard
└── 选择你的项目
    └── Settings
        └── API
            ├── Project URL → VITE_SUPABASE_URL
            └── Project API keys
                └── anon public → VITE_SUPABASE_ANON_KEY
```

### 钉钉配置位置

```
钉钉开发者后台 (open-dev.dingtalk.com)
└── 你的应用
    ├── 应用信息
    │   ├── AppKey → DINGTALK_APP_KEY
    │   ├── AppSecret → DINGTALK_APP_SECRET
    │   └── AgentId → DINGTALK_AGENT_ID
    │
    └── 机器人与消息推送
        └── 加密配置
            ├── Token → DINGTALK_TOKEN
            ├── EncodingAESKey → DINGTALK_AES_KEY
            └── CorpId → DINGTALK_CORP_ID
```

---

## ✅ 配置完成后的检查清单

- [ ] 已添加全部 10 个环境变量
- [ ] 变量名拼写完全正确（区分大小写）
- [ ] 变量值从源头复制，无多余空格
- [ ] `DINGTALK_AES_KEY` 长度为 43 位
- [ ] Railway 已自动触发重新部署
- [ ] 访问 `/health` 端点，三个配置都是 `true`
- [ ] 查看日志，无报错信息
- [ ] 钉钉回调 URL 已更新
- [ ] 在钉钉中测试提交成功

---

## 🆘 遇到问题？

### 问题：`/health` 显示 `hasSupabase: false`
**解决：** 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确

### 问题：`/health` 显示 `hasDingTalk: false`
**解决：** 检查 6 个 `DINGTALK_*` 变量是否都已添加

### 问题：`/health` 显示 `hasCrypto: false`
**解决：** 检查 `DINGTALK_TOKEN`、`DINGTALK_AES_KEY`、`DINGTALK_CORP_ID` 是否正确

### 问题：钉钉回调验证失败
**解决：**
1. 确认所有钉钉变量已配置
2. 确认 `DINGTALK_AES_KEY` 是 43 位
3. 等待部署完成（2-3分钟）
4. 查看 Railway 日志是否有错误

---

## 🎉 配置完成！

所有环境变量配置完成后，你的应用就可以正常运行了！

**下一步：**
1. 等待 Railway 重新部署完成
2. 访问 `/health` 验证配置
3. 更新钉钉回调 URL
4. 在钉钉中测试提交

祝使用愉快！🚀


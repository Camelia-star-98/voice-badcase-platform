# 钉钉"消息接收地址校验失败"排查指南

> 错误信息：**消息接收地址校验失败（请确保公网可访问该地址，如无有效SSL证书，可选择禁用证书校验）**

## 🎯 这个错误的真实原因

虽然错误提示是"SSL证书"问题，但**实际上99%的情况是配置问题**：

1. ❌ 环境变量未配置
2. ❌ 环境变量配置错误（有空格/换行）
3. ❌ 配置完未重新部署
4. ❌ Token/AESKey/CorpId 不匹配

**SSL证书问题极少见** - Vercel的证书都是自动的、有效的。

---

## ✅ 完整排查步骤

### 步骤1：确认Vercel环境变量

访问：https://vercel.com → 你的项目 → Settings → Environment Variables

**必须配置这6个变量：**

| 变量名 | 从哪里找 | 检查要点 |
|--------|---------|---------|
| `DINGTALK_APP_KEY` | 钉钉开放平台 → 你的应用 → 应用详情 | 以`ding`开头 |
| `DINGTALK_APP_SECRET` | 同上 | 32位字符串 |
| `DINGTALK_AGENT_ID` | 同上 | 纯数字 |
| `DINGTALK_TOKEN` | 钉钉开放平台 → 你的应用 → 机器人配置 | 20位左右 |
| `DINGTALK_AES_KEY` | 同上 | **必须43位！** |
| `DINGTALK_CORP_ID` | https://oa.dingtalk.com/ → 企业设置 | 以`ding`开头 |

#### ⚠️ 常见错误：

**错误1：复制时带了空格或换行**
```bash
# ❌ 错误
DINGTALK_AES_KEY="abc123...xyz   "  # 末尾有空格

# ✅ 正确
DINGTALK_AES_KEY="abc123...xyz"     # 没有空格
```

**错误2：AESKey长度不对**
```bash
# 检查AESKey长度
echo -n "你的AESKey" | wc -c
# 必须输出：43
```

**错误3：CorpId和AppKey搞混了**
```bash
# CorpId 是企业ID，在 https://oa.dingtalk.com/ 获取
# AppKey 是应用的Key，在开放平台获取
# 它们完全不同！
```

### 步骤2：重新部署

⚠️ **修改环境变量后，必须重新部署！**

1. 访问 Vercel → 你的项目
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧 `...` 菜单
5. 选择 **Redeploy**
6. 等待部署完成（1-2分钟）

### 步骤3：测试端点

部署完成后，在终端运行：

```bash
# 测试1：检查端点是否存在
curl https://你的项目名.vercel.app/api/dingtalk-bot

# 预期：返回 JSON 或 405 错误（说明端点存在）
# 如果返回 404 → 部署有问题，等几分钟再试
```

```bash
# 测试2：POST请求测试
curl -X POST https://你的项目名.vercel.app/api/dingtalk-bot \
  -H "Content-Type: application/json" \
  -d '{"test":"test"}'

# 预期：返回 {"success":true,"message":"Endpoint verified"}
```

### 步骤4：检查钉钉配置页

访问：https://open.dingtalk.com/ → 你的应用 → 机器人与消息推送

确认：

- [ ] 消息接收模式：**HTTP模式**（不是Stream模式）
- [ ] 消息接收地址：`https://你的项目名.vercel.app/api/dingtalk-bot`
- [ ] Token：与 `DINGTALK_TOKEN` 环境变量**完全一致**
- [ ] EncodingAESKey：与 `DINGTALK_AES_KEY` 环境变量**完全一致**（43位）

#### ⚠️ 对比三处配置

打开三个窗口对比：

| 配置项 | Vercel环境变量 | 钉钉机器人配置页 | 是否一致？ |
|--------|---------------|----------------|-----------|
| Token | `DINGTALK_TOKEN` | Token输入框 | ☑️ |
| AESKey | `DINGTALK_AES_KEY` | EncodingAESKey输入框 | ☑️ |
| URL | 无 | 消息接收地址 | ☑️ |

### 步骤5：查看Vercel函数日志

1. 访问 Vercel → 你的项目
2. 点击 **Deployments** → 最新部署
3. 点击 **Functions** 标签
4. 找到 `api/dingtalk-bot`
5. 点击查看日志

**点击钉钉的"保存"按钮后，立即查看日志！**

#### 日志分析：

**✅ 成功的日志：**
```
解密成功: success
返回加密响应: {...}
```

**❌ 失败的日志：**

| 错误日志 | 原因 | 解决方案 |
|---------|------|---------|
| `DINGTALK_TOKEN is not defined` | 环境变量未配置 | 添加环境变量并Redeploy |
| `签名校验失败` | Token配置错误 | 检查Token是否完全一致 |
| `解密失败` | AESKey配置错误 | 检查AESKey是否43位 |
| `Invalid signature` | Token或AESKey错误 | 重新复制配置 |
| 无日志 | 请求没到达服务器 | 检查URL是否正确 |

---

## 🔧 解决方案

### 方案1：完全重新配置（推荐）

如果多次验证失败，建议完全重新配置：

#### 1. 在钉钉开放平台重新生成密钥

1. 访问：https://open.dingtalk.com/
2. 你的应用 → 机器人与消息推送
3. 点击 **重新生成** Token和EncodingAESKey
4. **立即复制**新的值（不要关闭页面）

#### 2. 更新Vercel环境变量

1. 打开 Vercel → Settings → Environment Variables
2. 找到 `DINGTALK_TOKEN` → 点击编辑 → 粘贴新Token
3. 找到 `DINGTALK_AES_KEY` → 点击编辑 → 粘贴新AESKey
4. **检查没有多余的空格或换行！**

#### 3. Redeploy

1. Deployments → 最新部署 → ... → Redeploy
2. 等待完成（1-2分钟）

#### 4. 在钉钉保存配置

1. 确保Token和EncodingAESKey已填写
2. 消息接收地址：`https://你的项目名.vercel.app/api/dingtalk-bot`
3. 点击 **保存**
4. **立即**切换到Vercel查看函数日志

### 方案2：禁用SSL证书校验（不推荐）

如果钉钉页面有"禁用证书校验"选项，可以尝试勾选。

但这**不是真正的解决方案**，配置正确的话不需要禁用。

### 方案3：使用自定义域名

如果你有自己的域名：

1. 在Vercel添加自定义域名
2. 配置DNS指向Vercel
3. 使用自定义域名作为消息接收地址

---

## 🧪 测试脚本

### 测试1：验证环境变量

创建文件 `test-env.mjs`：

```javascript
// test-env.mjs
console.log('📋 检查环境变量配置\n');

const requiredEnvs = [
  'DINGTALK_APP_KEY',
  'DINGTALK_APP_SECRET',
  'DINGTALK_AGENT_ID',
  'DINGTALK_TOKEN',
  'DINGTALK_AES_KEY',
  'DINGTALK_CORP_ID'
];

requiredEnvs.forEach(envName => {
  const value = process.env[envName];
  if (!value) {
    console.log(`❌ ${envName}: 未配置`);
  } else {
    console.log(`✅ ${envName}: ${value.substring(0, 10)}... (${value.length}字符)`);
    
    if (envName === 'DINGTALK_AES_KEY' && value.length !== 43) {
      console.log(`   ⚠️  警告: AESKey长度是${value.length}，应该是43位！`);
    }
  }
});
```

**在Vercel函数中测试：**

由于无法直接在本地测试Vercel的环境变量，需要：

1. 临时修改 `api/dingtalk-bot.ts`
2. 在开头添加日志
3. Redeploy
4. 访问端点查看日志

```typescript
// 在 api/dingtalk-bot.ts 开头添加
console.log('环境变量检查:');
console.log('DINGTALK_TOKEN:', DINGTALK_TOKEN ? `${DINGTALK_TOKEN.substring(0,5)}...(${DINGTALK_TOKEN.length}字符)` : '未配置');
console.log('DINGTALK_AES_KEY:', DINGTALK_AES_KEY ? `${DINGTALK_AES_KEY.substring(0,5)}...(${DINGTALK_AES_KEY.length}字符)` : '未配置');
console.log('DINGTALK_CORP_ID:', DINGTALK_CORP_ID ? `${DINGTALK_CORP_ID.substring(0,8)}...` : '未配置');
```

### 测试2：本地测试加密

```bash
# 运行本地测试脚本
node test-dingtalk-crypto.mjs

# 预期输出：
# 🧪 开始测试钉钉加密解密功能
# ✅ 测试通过！
# ...
```

---

## 📞 常见问题FAQ

### Q1：为什么说SSL问题，但实际是配置问题？

**A：** 钉钉的错误提示不太准确。实际验证失败的原因包括：
- 签名验证失败 → 显示为"SSL问题"
- 解密失败 → 显示为"SSL问题"
- 网络超时 → 显示为"SSL问题"

真正的SSL证书问题非常罕见。

### Q2：我确定配置都对了，但还是失败？

**A：** 请检查：

1. **是否重新部署了？** 修改环境变量后必须Redeploy
2. **是否等待部署完成？** 不要在部署中途点击钉钉的保存
3. **AESKey是否正好43位？** 用 `echo -n "你的key" | wc -c` 检查
4. **是否有隐藏字符？** 直接在文本编辑器打开，看看有没有特殊符号

### Q3：Vercel函数日志在哪里？

**A：** 

1. https://vercel.com → 你的项目
2. **Deployments** → 点击最新部署
3. **Functions** 标签
4. 找到 `api/dingtalk-bot`
5. 点击展开查看日志

### Q4：能否在中国大陆加速访问？

**A：** 

方法1：在 `vercel.json` 添加：
```json
{
  "regions": ["hkg1", "sin1"]
}
```
这会让函数部署到香港/新加坡，更接近中国大陆。

方法2：使用自定义域名 + CDN加速

### Q5：如何确认钉钉真的发送了请求？

**A：** 

1. 在钉钉点击"保存"
2. **立即**打开Vercel函数日志
3. 应该看到新的日志条目

如果没有日志 → 请求没到达 → 检查URL是否正确

---

## 🎯 快速检查清单

在点击钉钉"保存"按钮之前，逐项确认：

- [ ] ✅ 已在Vercel配置全部6个环境变量
- [ ] ✅ 环境变量没有多余的空格或换行
- [ ] ✅ `DINGTALK_AES_KEY` 正好是43位
- [ ] ✅ 已经Redeploy并等待完成（1-2分钟）
- [ ] ✅ 测试端点返回正常（不是404）
- [ ] ✅ 钉钉配置页填写的Token/AESKey与Vercel完全一致
- [ ] ✅ 消息接收地址拼写正确（`/api/dingtalk-bot`）
- [ ] ✅ Vercel函数日志页面已打开，准备查看

**全部确认后，点击钉钉的"保存"按钮！**

---

## 📚 相关文档

- 🔍 [部署检查清单](./DINGTALK_DEPLOYMENT_CHECKLIST.md) - 完整检查清单
- 📘 [HTTP模式配置](./DINGTALK_HTTP_MODE_SETUP.md) - 图文教程
- ⚡ [快速配置](./DINGTALK_QUICKSTART.md) - 5分钟配置
- 📖 [技术实现](./DINGTALK_HTTP_IMPLEMENTATION.md) - 原理说明

---

**💡 还是不行？**

请提供以下信息：
1. Vercel函数日志截图
2. 钉钉开放平台的错误提示截图
3. 环境变量配置截图（隐藏敏感部分，但显示字符长度）

我们会帮你具体分析！


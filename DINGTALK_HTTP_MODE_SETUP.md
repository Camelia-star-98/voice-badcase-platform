# 钉钉HTTP模式配置详细指南

> 📖 **官方文档参考**：[钉钉HTTP回调概述](https://open.dingtalk.com/document/development/http-callback-overview)

## 🎯 为什么需要这些配置？

钉钉HTTP模式使用**加密通信**来保证消息安全。根据[钉钉官方规范](https://open.dingtalk.com/document/development/http-callback-overview)，配置过程需要6个关键参数：

1. **AppKey / AppSecret / AgentId** - 用于调用钉钉API发送消息
2. **Token / EncodingAESKey / CorpId** - 用于验证和加解密HTTP回调消息

---

## 📝 步骤1：创建企业内部应用

### 1.1 访问钉钉开放平台

1. 打开 https://open.dingtalk.com/
2. 使用管理员账号登录
3. 点击 **应用开发** → **企业内部开发**

### 1.2 创建应用

1. 点击 **创建应用**
2. 填写应用信息：
   - **应用名称**：`语音badcase上报反馈`
   - **应用描述**：`团队Badcase提报工具`
   - **应用图标**：上传图标（可选）
3. 点击 **确定创建**

### 1.3 记录基础信息

创建成功后，在应用详情页可以看到：

```
AppKey (Client ID): dingxxxxxxxxxxxxxxxx
AppSecret (Client Secret): xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AgentId: xxxxxxxxx
```

**⚠️ 妥善保管这些信息！**

---

## 📝 步骤2：配置HTTP回调

### 2.1 开启机器人功能

1. 在应用详情页，找到左侧菜单 **开发配置**
2. 点击 **机器人与消息推送**
3. 开启 **机器人配置**

### 2.2 选择HTTP模式

1. **消息接收模式** 选择：`HTTP模式`
2. 会显示加密配置区域

### 2.3 记录加密配置

钉钉会自动生成（或者你可以点击"重新生成"）：

```
Token: xxxxxxxxxxxxxxxxxxxx (随机字符串，20位左右)
EncodingAESKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (43位Base64字符串)
```

**📋 CorpId 获取方式：**

CorpId（企业ID）在钉钉管理后台可以找到：

1. 访问 https://oa.dingtalk.com/
2. 登录管理后台
3. 点击右上角 **企业设置**
4. 在 **企业信息** 页面可以看到 `CorpId`

```
CorpId: dingxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.4 配置回调地址

1. **消息接收地址** 填入：
   ```
   https://你的项目名.vercel.app/api/dingtalk-bot
   ```
   
   **示例**：
   - 如果你的Vercel项目是 `voice-badcase-platform`
   - 那么地址就是：`https://voice-badcase-platform.vercel.app/api/dingtalk-bot`

2. **暂时不要点击保存！** 先配置Vercel环境变量

---

## 📝 步骤3：配置Vercel环境变量

### 3.1 登录Vercel

1. 访问 https://vercel.com
2. 登录你的账号
3. 选择你的项目

### 3.2 添加环境变量

1. 点击顶部 **Settings** 标签
2. 点击左侧 **Environment Variables**
3. 依次添加以下6个变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DINGTALK_APP_KEY` | 应用的AppKey | `dingxxxxxxxxxxxxxxxx` |
| `DINGTALK_APP_SECRET` | 应用的AppSecret | `xxxxxxxxxxxxxxxxxxxxxx` |
| `DINGTALK_AGENT_ID` | 应用的AgentId | `123456789` |
| `DINGTALK_TOKEN` | HTTP回调Token | `xxxxxxxxxxxx` |
| `DINGTALK_AES_KEY` | HTTP回调加密密钥 | `xxxxxxxxxxxxxxxxxxxxxxxxxxx` (43位) |
| `DINGTALK_CORP_ID` | 企业ID | `dingxxxxxxxxxxxxxxxxxxxx` |

**添加方式：**
1. 在 "Key" 输入框输入变量名（如 `DINGTALK_APP_KEY`）
2. 在 "Value" 输入框输入对应的值
3. 选择环境：`Production`, `Preview`, `Development` 都勾选
4. 点击 **Add**
5. 重复以上步骤，添加所有6个变量

### 3.3 重新部署

添加完所有环境变量后：

1. 点击顶部 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**
5. 等待部署完成（通常1-2分钟）

---

## 📝 步骤4：完成钉钉配置

### 4.1 验证回调地址

回到钉钉开放平台：

1. 确认 **消息接收地址** 已填写：
   ```
   https://你的项目名.vercel.app/api/dingtalk-bot
   ```

2. 确认已填写 **Token** 和 **EncodingAESKey**

3. 点击 **保存**

4. 钉钉会自动发送验证请求到你的服务器

5. 如果配置正确，会提示：**验证成功** ✅

### 4.2 验证失败？

如果提示验证失败，检查：

- [ ] Vercel的6个环境变量都已正确添加
- [ ] 已点击 Redeploy 并等待部署完成
- [ ] URL格式正确，没有多余空格
- [ ] EncodingAESKey是43位字符串
- [ ] Token是正确的（注意不要复制错）

**查看日志：**
1. 访问 Vercel 项目
2. 点击 **Deployments** → 选择最新部署
3. 点击 **Functions** 标签
4. 找到 `api/dingtalk-bot` 查看日志

---

## 📝 步骤5：添加机器人到群

### 5.1 在钉钉群中添加

1. 打开钉钉群
2. 点击右上角 **群设置**
3. 选择 **智能群助手**
4. 点击 **添加机器人**
5. 选择 **企业机器人** 标签
6. 找到 **语音badcase上报反馈**
7. 点击 **添加**

### 5.2 测试机器人

在群里发送测试消息：

```
@语音badcase上报反馈 提报问题
```

机器人应该会回复一个提报模板。

---

## 🔍 验证配置是否正确

### 测试清单

- [ ] 发送 `@机器人 提报问题` 能收到模板
- [ ] 填写完整信息后，能成功提报
- [ ] 在网页平台能看到新提报的Badcase

### 完整测试消息

```
@语音badcase上报反馈 提报问题
学科：英语
分类：读音错误
优先级：P2
问题描述：单词"apple"发音不准确
出现位置：行课互动部分
问题提报人：张三
课节ID：12345
问题模型ID：model_001
期望修复时间：2025-12-30
```

应该收到回复：

```
✅ Badcase提报成功！

📋 ID: BC_XXXXXXXX_XXXXXXXX
📚 学科: 英语
📂 分类: 读音错误
...
```

---

## 🐛 常见问题排查

### Q1：验证地址一直失败

**可能原因：**
1. Vercel环境变量未生效 → 重新 Redeploy
2. EncodingAESKey复制错误 → 仔细检查是否43位
3. Token复制错误 → 重新复制粘贴
4. CorpId错误 → 确认从企业设置中获取

**调试方法：**

1. **测试端点是否可访问**：
```bash
curl https://你的项目名.vercel.app/api/dingtalk-bot
# 应该返回 405 或者一些JSON（说明端点存在）
```

2. **本地测试加密解密**（可选）：
```bash
# 运行测试脚本验证加密逻辑
node test-dingtalk-crypto.mjs
```

3. **查看Vercel日志**：
   - 访问 Vercel → 选择项目
   - Deployments → 最新部署 → Functions
   - 查看 `api/dingtalk-bot` 的日志输出

### Q2：机器人不回复

**可能原因：**
1. 未@机器人
2. 消息格式不对
3. 机器人权限不足

**解决方案：**
1. 确保消息中@了机器人
2. 检查是否包含"提报问题"关键词
3. 在钉钉开放平台检查应用的权限设置

### Q3：提报成功但平台看不到

**可能原因：**
1. Supabase配置问题
2. 网络延迟

**解决方案：**
1. 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 环境变量
2. 刷新页面或等待几秒

---

## 📚 参考资料

- **[钉钉HTTP回调概述](https://open.dingtalk.com/document/development/http-callback-overview)** ⭐ 官方规范文档
- [钉钉企业内部开发文档](https://open.dingtalk.com/document/orgapp/develop-org-internal-app)
- [钉钉机器人开发指南](https://open.dingtalk.com/document/orgapp/robot-overview)
- [钉钉加密解密说明](https://open.dingtalk.com/document/development/message-encryption-and-decryption)
- [Vercel环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ 完成！

配置完成后，你的团队就可以在钉钉群中快速提报Badcase了！

有任何问题，请查看日志或联系技术支持。


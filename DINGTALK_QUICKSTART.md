# 钉钉企业内部机器人快速配置清单

## ✅ 配置步骤（5分钟完成）

### 步骤1：创建企业内部应用（2分钟）

1. 访问 https://open.dingtalk.com/
2. 点击 **应用开发** → **企业内部开发** → **创建应用**
3. 填写应用名称：`语音badcase上报反馈`
4. 记录以下信息：
   ```
   AppKey: _________________
   AppSecret: _________________
   AgentId: _________________
   ```

### 步骤2：配置机器人（2分钟）

1. 在应用页面，点击 **机器人与消息推送**
2. 开启 **机器人配置**
3. 消息接收模式选择：**HTTP模式**
4. 记录加密配置信息：
   ```
   Token: _________________
   EncodingAESKey: _________________
   CorpId: _________________
   ```
5. 消息接收地址填入：
   ```
   https://你的项目名.vercel.app/api/dingtalk-bot
   ```
6. 点击 **保存**（会自动验证）

### 步骤3：配置Vercel环境变量（1分钟）

1. 访问 https://vercel.com
2. 进入项目 → **Settings** → **Environment Variables**
3. 添加以下6个变量：

| 变量名 | 值（从步骤1和步骤2获取） |
|--------|------------------|
| `DINGTALK_APP_KEY` | 你的AppKey |
| `DINGTALK_APP_SECRET` | 你的AppSecret |
| `DINGTALK_AGENT_ID` | 你的AgentId |
| `DINGTALK_TOKEN` | 你的Token |
| `DINGTALK_AES_KEY` | 你的EncodingAESKey |
| `DINGTALK_CORP_ID` | 你的CorpId |

4. 点击 **Save** → 点击 **Redeploy**

### 步骤4：添加机器人到群（30秒）

1. 打开钉钉群
2. 群设置 → **智能群助手** → **添加机器人**
3. 选择 **企业机器人** 标签
4. 选择 **语音badcase上报反馈** → **添加**

### 步骤5：测试（30秒）

在群里发送：

```
@语音badcase上报反馈 提报问题
学科：英语
分类：读音错误
描述：测试钉钉集成
```

应该收到回复：`✅ Badcase提报成功！`

---

## 🎯 完整消息格式

### 必填字段：
```
@语音badcase上报反馈 提报问题
学科：英语
分类：读音错误
描述：具体问题描述
```

### 完整格式（包含可选字段）：
```
@语音badcase上报反馈 提报问题
学科：英语
位置：行课互动
CMS课节ID：12345
TTS课节ID：67890
模型ID：model_001
分类：读音错误
描述：单词"apple"的发音不准确
提报人：张三
期望修复：2025-12-30
```

---

## 🔍 常见问题

### Q1：机器人不回复？

**检查清单：**
- [ ] Vercel环境变量已配置
- [ ] 已点击Redeploy重新部署
- [ ] 消息接收地址验证通过
- [ ] 消息中@了机器人
- [ ] 首行是"提报问题"

### Q2：验证地址失败？

**解决方案：**
1. 确认URL格式：`https://项目名.vercel.app/api/dingtalk-bot`
2. 确认已配置所有6个环境变量（包括Token、AESKey、CorpId）
3. 等待1-2分钟让部署生效
4. 检查Vercel函数日志是否有错误信息
5. 确认EncodingAESKey正确（43位字符串）

### Q3：提示缺少必填字段？

**解决方案：**
确保包含：
- 学科：xxx
- 分类：xxx
- 描述：xxx

使用**冒号**（中文`：`或英文`:`）分隔字段名和值。

---

## 📚 详细文档

**⚠️ HTTP模式配置遇到问题？** 

- 🔍 **[部署检查清单](./DINGTALK_DEPLOYMENT_CHECKLIST.md)** - 部署前必读，逐项检查配置
- 📘 **[HTTP模式详细配置指南](./DINGTALK_HTTP_MODE_SETUP.md)** - 完整的图文教程
- 📖 [完整配置指南](./DINGTALK_ENTERPRISE_SETUP.md)
- 🔧 [API实现代码](./api/dingtalk-bot.ts)

---

## 🎉 完成！

配置成功后，团队成员就可以在钉钉群中快速提报Badcase了！

有问题？查看完整文档或联系管理员。

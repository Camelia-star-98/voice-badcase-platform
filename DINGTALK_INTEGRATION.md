# 钉钉机器人集成指南 🤖

本指南详细说明如何将钉钉机器人与Voice Badcase Platform集成，实现在钉钉群中直接提报问题。

## 📋 目录

- [功能概述](#功能概述)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [使用方法](#使用方法)
- [消息格式](#消息格式)
- [故障排查](#故障排查)

## 🎯 功能概述

### 实现效果

```
钉钉群聊 → 发送消息 → 机器人解析 → 自动创建Badcase → 平台实时显示
```

### 核心优势

- ✅ **无需登录平台** - 在钉钉群中即可提报问题
- ✅ **快速响应** - 1-2秒内完成数据同步
- ✅ **自动解析** - 智能提取字段信息
- ✅ **即时反馈** - 机器人自动回复提报结果
- ✅ **实时更新** - 平台自动显示新数据

## 🚀 快速开始

### 第一步：创建钉钉自定义机器人

1. **打开钉钉群设置**
   - 进入需要集成的钉钉群
   - 点击右上角 `...` → `智能群助手` → `添加机器人`

2. **选择"自定义"机器人**
   - 点击 `自定义` → `添加`
   - 填写机器人名称：`Badcase提报助手`
   - 上传机器人头像（可选）

3. **配置安全设置**
   
   **推荐方式：加签**
   - 勾选 `加签`
   - 记录生成的 `SEC...` 开头的密钥（后面需要用）
   
   **或者使用关键词**
   - 勾选 `自定义关键词`
   - 添加关键词：`提报问题`

4. **获取Webhook地址**
   - 复制生成的Webhook URL（类似 `https://oapi.dingtalk.com/robot/send?access_token=xxx`）
   - 点击 `完成`

### 第二步：部署Webhook处理端点

#### 方式1：使用Vercel部署（推荐）

1. **配置环境变量**
   
   在Vercel项目设置中添加以下环境变量：
   
   ```bash
   # Supabase配置（已有）
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   
   # 钉钉机器人密钥（新增）
   DINGTALK_SECRET=SEC... # 第一步中获取的加签密钥
   ```

2. **部署代码**
   
   ```bash
   cd voice-badcase-platform
   git add api/dingtalk-webhook.ts
   git commit -m "feat: add DingTalk webhook integration"
   git push origin main
   ```

3. **获取API端点URL**
   
   部署成功后，你的Webhook端点地址为：
   ```
   https://your-project.vercel.app/api/dingtalk-webhook
   ```

#### 方式2：使用Supabase Edge Functions

<details>
<summary>点击展开Supabase Edge Functions部署方法</summary>

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录Supabase
supabase login

# 创建Edge Function
supabase functions new dingtalk-webhook

# 部署函数
supabase functions deploy dingtalk-webhook

# 设置环境变量
supabase secrets set DINGTALK_SECRET=your_secret
```

Edge Function URL:
```
https://your-project.supabase.co/functions/v1/dingtalk-webhook
```

</details>

### 第三步：配置钉钉Outgoing机器人（可选）

如果使用自定义机器人无法满足需求，可以创建企业内部应用：

1. 访问钉钉开放平台：https://open-dev.dingtalk.com/
2. 创建企业内部应用
3. 配置机器人消息接收地址为你的Webhook端点
4. 配置消息推送 → 填写URL和Token

## 📝 使用方法

### 基本用法

在钉钉群中发送以下格式的消息：

```
提报问题
学科：英语
位置：行课互动
CMS课节ID：123456
分类：读音错误
描述：A相关的单词发音不准确
提报人：张三
期望修复：2025-12-30
```

### 消息格式详解

#### 必填字段 ⚠️

| 字段 | 说明 | 示例 |
|------|------|------|
| **学科** | 出现问题的学科 | 英语、数学、语文 |
| **分类** | 问题类型 | 读音错误、停顿不当、语速异常 |
| **描述** | 详细问题描述 | A相关的单词发音不准确 |

#### 选填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| **位置** | 出现位置 | 行课互动 / 全程TTS |
| **CMS课节ID** | 行课互动课节ID | 123456 |
| **TTS课节ID** | 全程TTS课节ID | 789012 |
| **模型ID** | 问题模型ID | model_12345 |
| **提报人** | 提报人姓名 | 张三 |
| **期望修复** | 期望修复日期 | 2025-12-30 |

### 消息格式示例

#### 示例1：最简格式

```
提报问题
学科：英语
分类：读音错误
描述：A相关的单词发音不准确
```

#### 示例2：完整格式

```
提报问题
学科：英语
位置：行课互动
CMS课节ID：123456
模型ID：model_abc123
分类：读音错误
描述：A相关的单词发音不准确，目前测到的文本：aim, able
提报人：张三
期望修复：2025-12-30
```

#### 示例3：全程TTS问题

```
提报问题
学科：数学
位置：全程TTS
TTS课节ID：789012
分类：停顿不当
描述：讲解过程中停顿位置不合理
提报人：李四
```

### 机器人响应

#### 成功响应 ✅

```
✅ Badcase提报成功！

ID: BC_MJIJVM4Y_ZMXV93S7
学科: 英语
分类: 读音错误
提报人: 张三

已同步到平台，可前往查看详情。
```

#### 失败响应 ❌

```
❌ 提报失败！缺少必填字段。

必填字段：
• 学科
• 分类
• 描述
```

## 🔧 高级配置

### 自定义解析规则

如果你的团队有特定的消息格式，可以修改 `api/dingtalk-webhook.ts` 中的 `parseBadcaseFromMessage` 函数：

```typescript
function parseBadcaseFromMessage(text: string): any {
  // 自定义解析逻辑
  // 例如：支持英文字段名、简写等
}
```

### 添加@mention功能

在钉钉机器人配置中启用@功能后，可以实现：

```
@Badcase提报助手 提报问题
学科：英语
...
```

### 支持文件上传

如果需要上传音频文件，可以：

1. 使用钉钉文件上传API
2. 将文件URL传递给Webhook
3. Webhook下载文件并上传到Supabase Storage

```typescript
// 在webhook中处理文件
const { mediaId } = req.body;
const fileUrl = await downloadFromDingTalk(mediaId);
const { data } = await supabase.storage
  .from('audio-files')
  .upload(`${badcaseId}.mp3`, fileBuffer);
```

### 权限控制

限制只有特定用户可以提报：

```typescript
// 在webhook中检查发送者
const { senderStaffId } = req.body;
const allowedUsers = ['user1', 'user2', 'user3'];

if (!allowedUsers.includes(senderStaffId)) {
  return res.status(200).json({
    msg_type: 'text',
    content: { text: '❌ 无权限提报' }
  });
}
```

## 🎯 使用场景

### 场景1：团队日常提报

```
产品经理在钉钉群中发现问题
→ 直接在群里发送提报消息
→ 机器人自动创建记录
→ 技术团队在平台看到并处理
```

### 场景2：测试团队批量提报

```
测试人员测试时发现多个问题
→ 在测试群中逐条发送
→ 所有问题自动录入系统
→ 避免手动录入的繁琐
```

### 场景3：用户反馈快速响应

```
客户通过钉钉反馈问题
→ 客服人员转发到内部群
→ 添加"提报问题"标记
→ 自动进入处理流程
```

## 🐛 故障排查

### 问题1：机器人无响应

**可能原因**：
- Webhook地址配置错误
- 服务未部署成功
- 网络连接问题

**解决方法**：
```bash
# 1. 检查Vercel部署状态
vercel logs

# 2. 测试Webhook端点
curl -X POST https://your-project.vercel.app/api/dingtalk-webhook \
  -H "Content-Type: application/json" \
  -d '{"msgtype":"text","text":{"content":"提报问题\n学科：英语\n分类：读音错误\n描述：测试"}}'

# 3. 查看钉钉机器人日志
# 在钉钉开放平台查看推送记录
```

### 问题2：签名验证失败

**可能原因**：
- DINGTALK_SECRET配置错误
- 时间戳不一致

**解决方法**：
1. 检查环境变量是否正确设置
2. 确认复制的密钥完整（包含SEC前缀）
3. 检查服务器时间是否同步

### 问题3：字段解析错误

**可能原因**：
- 消息格式不正确
- 使用了全角冒号
- 字段名拼写错误

**解决方法**：
1. 严格按照示例格式填写
2. 使用半角冒号 `:` 而不是全角 `：`
3. 字段名与示例保持一致

### 问题4：数据未同步到平台

**可能原因**：
- Supabase连接失败
- 权限配置问题
- Realtime未启用

**解决方法**：
```bash
# 1. 检查Supabase环境变量
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 2. 测试数据库连接
# 在Supabase控制台执行：
SELECT * FROM badcases ORDER BY created_at DESC LIMIT 1;

# 3. 确认Realtime已启用
# Supabase控制台 → Database → Replication → badcases表启用
```

## 📊 监控和日志

### 查看处理日志

**Vercel部署**：
```bash
# 实时查看日志
vercel logs --follow

# 查看特定函数日志
vercel logs --since 1h
```

**Supabase Edge Functions**：
```bash
# 查看函数日志
supabase functions logs dingtalk-webhook
```

### 统计使用情况

在Supabase中创建视图统计钉钉提报：

```sql
-- 统计钉钉提报数量
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM badcases
WHERE reporter IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🔐 安全建议

1. **启用加签验证** - 防止恶意请求
2. **设置速率限制** - 防止刷量攻击
3. **敏感信息脱敏** - 不在响应中暴露完整数据
4. **日志审计** - 记录所有提报操作
5. **权限控制** - 限制提报人员范围

## 📚 参考资料

- [钉钉自定义机器人文档](https://open.dingtalk.com/document/robots/custom-robot-access)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Voice Badcase Platform文档](./README.md)

## 💬 技术支持

遇到问题？
1. 查看本文档的故障排查章节
2. 查看项目Issues
3. 联系开发团队

---

**祝你使用愉快！🎉**


# 钉钉HTTP模式部署检查清单

> 在钉钉开放平台点击"保存"验证地址之前，请逐项检查以下内容

## ✅ 1. Vercel环境变量配置

访问 https://vercel.com → 你的项目 → Settings → Environment Variables

确认以下6个变量都已添加：

- [ ] `DINGTALK_APP_KEY` - 应用的AppKey（以`ding`开头）
- [ ] `DINGTALK_APP_SECRET` - 应用的AppSecret（32位字符串）
- [ ] `DINGTALK_AGENT_ID` - 应用的AgentId（纯数字）
- [ ] `DINGTALK_TOKEN` - HTTP回调Token（20位左右字符串）
- [ ] `DINGTALK_AES_KEY` - HTTP回调加密密钥（**必须是43位**）
- [ ] `DINGTALK_CORP_ID` - 企业ID（以`ding`开头）

**⚠️ 特别注意：**
- `DINGTALK_AES_KEY` 必须正好是43位字符！
- 复制时不要有多余的空格或换行
- 确保选择了 Production、Preview、Development 三个环境

## ✅ 2. 重新部署

配置环境变量后，必须重新部署才能生效：

- [ ] 点击 Deployments 标签
- [ ] 找到最新部署
- [ ] 点击右侧 `...` 菜单
- [ ] 选择 **Redeploy**
- [ ] 等待部署完成（显示 ✓ Ready）

**部署时间：通常1-2分钟**

## ✅ 3. 测试端点可访问性

部署完成后，在终端运行：

```bash
curl https://你的项目名.vercel.app/api/dingtalk-bot
```

**预期结果：**
- 返回 `405 Method Not Allowed` 或类似JSON响应
- 说明端点存在且可访问

**如果报错404：**
- 检查URL是否正确
- 等待几分钟让部署完全生效

## ✅ 4. 钉钉开放平台配置

访问 https://open.dingtalk.com/ → 你的应用 → 机器人与消息推送

确认以下配置：

- [ ] 消息接收模式：**HTTP模式**
- [ ] 消息接收地址：`https://你的项目名.vercel.app/api/dingtalk-bot`
- [ ] Token：与 `DINGTALK_TOKEN` 环境变量一致
- [ ] EncodingAESKey：与 `DINGTALK_AES_KEY` 环境变量一致（43位）

## ✅ 5. 验证配置

现在可以点击钉钉开放平台的 **保存** 按钮了！

**钉钉会自动发送验证请求到你的服务器。**

### 成功标志：
✅ 钉钉页面显示：**"验证成功"** 或 **"保存成功"**

### 失败排查：

如果验证失败，按以下顺序检查：

#### 步骤1：检查Vercel日志

1. 访问 Vercel → 你的项目
2. 点击 **Deployments** → 选择最新部署
3. 点击 **Functions** 标签
4. 找到 `api/dingtalk-bot`
5. 查看是否有错误日志

**常见错误：**
- `DINGTALK_TOKEN is not defined` → 环境变量未配置
- `Invalid signature` → Token或AESKey配置错误
- `Decrypt failed` → AESKey长度不对（必须43位）

#### 步骤2：对比配置

| 配置项 | Vercel环境变量 | 钉钉开放平台 |
|--------|---------------|------------|
| Token | `DINGTALK_TOKEN` | 机器人配置页的Token |
| AESKey | `DINGTALK_AES_KEY` | 机器人配置页的EncodingAESKey |
| CorpId | `DINGTALK_CORP_ID` | 企业设置中的CorpId |

**确保三处完全一致！**

#### 步骤3：重新生成密钥（最后手段）

如果始终验证失败：

1. 在钉钉开放平台，点击 **重新生成** Token和EncodingAESKey
2. 复制新的值
3. 更新Vercel环境变量
4. Redeploy
5. 再次保存验证

## ✅ 6. 测试机器人功能

验证成功后，测试机器人是否能正常工作：

### 6.1 添加机器人到群

- [ ] 打开钉钉群
- [ ] 点击右上角群设置
- [ ] 选择 **智能群助手**
- [ ] 添加你的企业机器人

### 6.2 测试对话

在群里发送：

```
@你的机器人名 提报问题
```

**预期结果：**
- 机器人回复提报模板
- 包含完整的字段说明

### 6.3 测试提报

填写模板后@机器人发送：

```
@你的机器人名 提报问题
学科：英语
分类：读音错误
优先级：P2
问题描述：测试问题
问题提报人：测试员
问题模型ID：test001
期望修复时间：2025-12-31
```

**预期结果：**
- 机器人回复 "✅ Badcase提报成功！"
- 显示完整的提报信息
- 平台上能看到新数据

## 🎉 全部完成！

如果以上测试都通过，说明配置完全正确！

你的团队现在可以在钉钉群中快速提报Badcase了。

---

## 📞 遇到问题？

### 常见问题速查

| 症状 | 可能原因 | 解决方案 |
|------|---------|---------|
| 验证地址失败 | 环境变量未生效 | Redeploy后等2分钟 |
| 验证地址失败 | AESKey长度错误 | 检查是否43位字符 |
| 验证地址失败 | CorpId错误 | 从企业设置重新复制 |
| 机器人不回复 | 未@机器人 | 确保消息中@了机器人 |
| 机器人不回复 | 权限不足 | 检查应用权限配置 |
| 提报成功但平台看不到 | Supabase配置 | 检查数据库连接 |

### 联系支持

如果问题仍然存在，请提供：
1. Vercel函数日志截图
2. 钉钉开放平台的错误提示
3. 环境变量配置截图（隐藏敏感值）

---

**📖 参考文档：**
- [钉钉HTTP回调概述](https://open.dingtalk.com/document/development/http-callback-overview)
- [详细配置指南](./DINGTALK_HTTP_MODE_SETUP.md)
- [快速配置清单](./DINGTALK_QUICKSTART.md)


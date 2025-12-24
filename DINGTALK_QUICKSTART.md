# 钉钉集成快速配置清单

## ✅ 第一步：创建钉钉机器人（5分钟）

1. 打开钉钉群 → 右上角`...` → `智能群助手` → `添加机器人`
2. 选择`自定义` → 填写名称：`Badcase提报助手`
3. 安全设置：勾选`加签`，记录密钥（`SEC...`开头）
4. 复制Webhook URL，点击完成

## ✅ 第二步：配置环境变量（2分钟）

在Vercel项目设置中添加：

```bash
DINGTALK_SECRET=SEC你的密钥  # 第一步获取的加签密钥
```

## ✅ 第三步：部署代码（3分钟）

```bash
cd voice-badcase-platform
npm install  # 安装新依赖
git add .
git commit -m "feat: add DingTalk integration"
git push origin main
```

等待Vercel自动部署完成（约2分钟）。

## ✅ 第四步：测试（2分钟）

1. 打开辅助工具：`https://your-project.vercel.app/dingtalk-helper.html`
2. 填写测试数据，生成消息
3. 复制消息到钉钉群发送
4. 等待机器人回复确认

## 📱 快速测试消息

复制以下内容到钉钉群测试：

```
提报问题
学科：英语
分类：读音错误
描述：测试钉钉集成功能
```

## 🎯 使用提示

### 方式1：使用网页助手（推荐新手）

访问：`https://your-project.vercel.app/dingtalk-helper.html`

- 填写表单自动生成标准格式
- 一键复制到钉钉
- 避免格式错误

### 方式2：直接输入（推荐熟练用户）

记住格式，直接在钉钉输入：

```
提报问题
学科：英语
位置：行课互动
CMS课节ID：123456
分类：读音错误
描述：具体问题描述
提报人：张三
期望修复：2025-12-30
```

## ⚠️ 注意事项

1. **必填字段**：学科、分类、描述
2. **冒号格式**：使用中文冒号`：`或英文`:`都可以
3. **首行必须**：`提报问题`或`新建badcase`
4. **一行一个字段**：每个字段单独一行

## 🔗 相关链接

- 📚 [完整文档](./DINGTALK_INTEGRATION.md)
- 🛠️ [辅助工具](https://your-project.vercel.app/dingtalk-helper.html)
- 🚀 [平台首页](https://your-project.vercel.app)

## 💬 遇到问题？

1. 检查机器人是否添加成功
2. 确认环境变量配置正确
3. 查看Vercel部署日志
4. 参考完整文档排查

---

**预计总耗时：12分钟** ⏱️


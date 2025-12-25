# 🚀 快速入门指南

> 5 分钟让你开始为语音 Badcase 平台贡献代码！

---

## 📋 前置要求

- ✅ Git 已安装
- ✅ Node.js >= 16 已安装
- ✅ GitHub 账号已配置
- ✅ 已被添加到项目仓库

---

## 🎯 第一次使用（只需做一次）

### 1️⃣ 克隆仓库

```bash
# 克隆项目到本地
git clone https://github.com/Camelia-star-98/voice-badcase-platform.git

# 进入项目目录
cd voice-badcase-platform
```

### 2️⃣ 安装依赖

```bash
# 安装项目依赖
npm install

# 等待安装完成...
```

### 3️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入你的 Supabase 配置
# VITE_SUPABASE_URL=你的项目URL
# VITE_SUPABASE_ANON_KEY=你的anon key
```

💡 **提示**：Supabase 配置请联系项目负责人获取。

**可选：钉钉集成配置**

如果需要使用钉钉机器人功能，额外添加：

```bash
# 在 .env.local 中添加
DINGTALK_SECRET=你的钉钉机器人密钥
```

### 4️⃣ 启动开发服务器

```bash
# 启动本地开发环境
npm run dev

# 看到以下提示表示成功：
# ➜ Local: http://localhost:5173/
```

🎉 **完成！** 打开浏览器访问 http://localhost:5173 查看项目。

---

## 💻 日常开发流程（重要！）

### 📝 开发新功能的 4 个步骤

#### 步骤 1：创建功能分支

```bash
# 切换到 main 分支并更新
git checkout main
git pull origin main

# 创建新的功能分支
git checkout -b feature/your-feature-name

# 分支命名示例：
# feature/add-export-button      # 新功能
# bugfix/audio-playback-error    # 修复 bug
# docs/update-readme             # 更新文档
```

#### 步骤 2：开发功能

```bash
# 1. 编写代码...

# 2. 本地测试
npm run dev

# 3. 检查代码规范
npm run lint

# 4. 构建测试
npm run build
```

#### 步骤 3：提交代码

```bash
# 查看修改了哪些文件
git status

# 添加所有改动到暂存区
git add .

# 提交代码（使用规范的提交信息）
git commit -m "feat: 添加数据导出功能"

# 提交信息格式：
# feat: 新功能
# fix: 修复 bug
# refactor: 代码重构
# docs: 文档更新
# style: 样式调整
```

#### 步骤 4：推送并创建 PR

```bash
# 推送到 GitHub
git push origin feature/your-feature-name
```

然后在 GitHub 上：

1. 访问仓库页面
2. 点击 **"Compare & pull request"** 按钮
3. 填写 PR 描述
4. 点击 **"Create pull request"**
5. 等待团队审核

---

## 📊 PR 描述模板

复制以下模板填写你的 PR：

```markdown
## 📝 变更说明
简要描述本次改动的内容和目的

## 🎯 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 代码重构
- [ ] 样式调整
- [ ] 文档更新

## ✅ 测试情况
- [ ] 本地测试通过
- [ ] 无 lint 错误
- [ ] 无 TypeScript 错误
- [ ] 无构建错误

## 📸 截图（如适用）
如果是 UI 相关改动，请提供截图

## 🔗 相关 Issue
如有关联的 Issue，请填写编号：#123
```

---

## 🔄 常用场景

### 场景 1：每天开始工作前

```bash
# 更新 main 分支到最新
git checkout main
git pull origin main

# 然后创建新分支或切换到已有分支
git checkout feature/your-feature
```

### 场景 2：工作到一半需要切换分支

```bash
# 暂存当前工作
git stash

# 切换到其他分支
git checkout other-branch

# 完成其他工作后，回来继续
git checkout feature/your-feature
git stash pop
```

### 场景 3：解决代码冲突

```bash
# 1. 拉取最新的 main 分支
git fetch origin
git rebase origin/main

# 2. 如果有冲突，会提示你
# 打开冲突文件，找到 <<<<<<< 和 >>>>>>> 标记
# 手动解决冲突

# 3. 解决后标记为已解决
git add .
git rebase --continue

# 4. 推送（需要强制推送）
git push origin feature/your-feature --force
```

### 场景 4：修改最后一次提交

```bash
# 修改代码后
git add .

# 修改上一次提交（不改提交信息）
git commit --amend --no-edit

# 或修改提交信息
git commit --amend -m "feat: 新的提交信息"

# 推送（需要强制推送）
git push origin feature/your-feature --force
```

---

## ⚠️ 重要规则（必读！）

### ❌ 千万不要做

1. **不要直接在 main 分支开发**
   ```bash
   # ❌ 错误做法
   git checkout main
   # 直接修改代码...
   
   # ✅ 正确做法
   git checkout -b feature/my-feature  # 先创建分支
   ```

2. **不要提交敏感信息**
   - ❌ `.env.local`（包含密钥）
   - ❌ `.env.production`
   - ❌ Supabase 密钥
   - ❌ 钉钉机器人密钥
   - ❌ API 密钥

3. **不要提交不必要的文件**
   - ❌ `node_modules/`
   - ❌ `dist/` 或 `build/`
   - ❌ `.DS_Store`
   - ❌ `*.log` 文件

4. **不要强制推送到 main**
   ```bash
   # ❌ 永远不要这样做
   git push origin main --force
   ```

### ✅ 一定要做

1. **提交前检查**
   ```bash
   npm run lint      # 检查代码规范
   npm run build     # 测试构建
   git status        # 确认提交内容
   ```

2. **写清晰的提交信息**
   ```bash
   # ✅ 好的提交信息
   git commit -m "feat: 添加批量删除功能"
   git commit -m "fix: 修复音频播放卡顿问题"
   
   # ❌ 不好的提交信息
   git commit -m "更新"
   git commit -m "修改代码"
   ```

3. **经常提交**
   - 完成一个小功能就提交
   - 不要一次提交太多改动

4. **保持分支同步**
   ```bash
   # 定期更新你的功能分支
   git fetch origin
   git rebase origin/main
   ```

---

## 📋 提交前检查清单

每次提交 PR 前，请确认：

```bash
✅ 功能开发完成
✅ 本地测试通过
✅ npm run lint 无错误
✅ npm run build 构建成功
✅ git status 确认提交内容正确
✅ 提交信息符合规范
✅ PR 描述清晰完整
✅ 没有提交敏感信息
```

---

## 🎓 Git 命令速查表

### 常用命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看所有分支
git branch -a

# 查看代码改动
git diff

# 撤销工作区的修改
git checkout -- <file>

# 撤销暂存区的修改
git reset HEAD <file>

# 查看远程仓库
git remote -v
```

### 分支操作

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 切换分支
git checkout branch-name

# 删除本地分支
git branch -d branch-name

# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a
```

### 提交操作

```bash
# 添加所有改动
git add .

# 添加指定文件
git add path/to/file

# 提交
git commit -m "commit message"

# 修改上一次提交
git commit --amend

# 撤销上一次提交（保留改动）
git reset HEAD~1

# 撤销上一次提交（删除改动）
git reset --hard HEAD~1
```

---

## 🆘 遇到问题？

### 1. 查看文档

- 📖 **完整协作指南**：[CONTRIBUTING.md](./CONTRIBUTING.md)
- 📖 **新成员入职**：[新成员入职指南.md](./新成员入职指南.md)
- 📖 **项目介绍**：[README.md](./README.md)
- 📖 **Supabase 配置**：[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- 📖 **钉钉集成**：[DINGTALK_QUICKSTART.md](./DINGTALK_QUICKSTART.md)

### 2. 常见问题

**Q: npm install 失败？**
```bash
# 清理缓存后重试
npm cache clean --force
npm install
```

**Q: 端口被占用？**
```bash
# 修改 vite.config.ts 中的端口
# 或杀死占用端口的进程
lsof -ti:5173 | xargs kill -9
```

**Q: Git 推送失败？**
```bash
# 确保你有权限访问仓库
# 检查远程仓库地址
git remote -v

# 如果是认证问题，配置 SSH 或使用 Personal Access Token
```

**Q: Lint 错误太多？**
```bash
# 自动修复部分问题
npm run lint -- --fix

# 如果还有错误，手动修复
```

**Q: Supabase 连接失败？**
```bash
# 检查 .env.local 文件是否存在
# 确认环境变量配置正确
# 检查浏览器控制台错误信息
```

### 3. 获取帮助

- 💬 在 GitHub 上提 Issue
- 💬 联系项目负责人 @Camelia-star-98
- 💬 查看团队文档

---

## 🎯 开发流程总结

**记住这 4 步，就能开始贡献代码了：**

```bash
# 1️⃣ 创建分支
git checkout main
git pull origin main
git checkout -b feature/your-feature

# 2️⃣ 开发测试
# ... 编写代码 ...
npm run dev
npm run lint
npm run build

# 3️⃣ 提交代码
git add .
git commit -m "feat: 描述你的改动"
git push origin feature/your-feature

# 4️⃣ 创建 PR
# 在 GitHub 上创建 Pull Request
# 填写描述，等待审核
```

---

## 📚 推荐阅读

想深入了解？阅读这些资源：

### 项目文档
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 详细的协作规范
- [新成员入职指南.md](./新成员入职指南.md) - 完整的入职培训
- [README.md](./README.md) - 项目功能介绍
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 数据库配置
- [DINGTALK_QUICKSTART.md](./DINGTALK_QUICKSTART.md) - 钉钉集成

### 技术文档
- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Ant Design 组件库](https://ant.design/)
- [Supabase 文档](https://supabase.com/docs)

### Git 学习
- [Git 官方教程](https://git-scm.com/book/zh/v2)
- [GitHub 帮助文档](https://docs.github.com/zh)

---

## 💡 小贴士

- 🔥 **小步快跑**：经常提交，每次只做一件事
- 🤝 **多沟通**：有问题就问，没有愚蠢的问题
- 📝 **写好注释**：让别人（和未来的自己）能看懂代码
- ⚡ **保持同步**：每天更新 main 分支
- 🎯 **关注细节**：提交前仔细检查

---

## 🎤 项目特色功能

### 📊 数据可视化

项目支持丰富的数据统计和可视化功能：
- 问题趋势分析
- 学科分布统计
- 状态流转追踪

### 🤖 钉钉集成

通过钉钉机器人快速提报 Badcase：

```
提报问题
学科：英语
分类：读音错误
描述：A相关的单词发音不准确
提报人：张三
```

详见 [DINGTALK_QUICKSTART.md](./DINGTALK_QUICKSTART.md)

### 🔔 实时同步

支持多用户实时协作，一个用户的操作会立即同步到其他用户。

---

**准备好了吗？开始你的第一个 PR 吧！** 🚀

如有任何问题，随时查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 或联系团队成员。

祝你编码愉快！✨


# 🤝 团队协作指南

欢迎加入语音 Badcase 平台开发团队！本指南将帮助你快速上手项目开发和团队协作。

## 📋 目录

- [快速开始](#快速开始)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [Git 工作流](#git-工作流)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 1. 获取代码

```bash
# 克隆仓库
git clone https://github.com/Camelia-star-98/voice-badcase-platform.git
cd voice-badcase-platform

# 安装依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，填入你的配置
# 从团队负责人或 Supabase 控制台获取这些值
```

**重要**：`.env.local` 文件包含敏感信息，已被 Git 忽略，不会被提交到仓库。

需要配置的环境变量：
- `VITE_SUPABASE_URL`: Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `DINGTALK_SECRET`: 钉钉机器人密钥（可选）

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173（Vite 默认端口）

### 4. 验证配置

打开浏览器，确认：
- ✅ 页面正常加载
- ✅ 能够查看 Badcase 列表
- ✅ 能够添加/编辑记录
- ✅ 浏览器控制台无错误

---

## 🔄 开发流程

### 推荐工作流（分支模式）

我们使用功能分支工作流，确保主分支始终稳定：

```bash
# 1. 开始新功能前，先拉取最新代码
git checkout main
git pull origin main

# 2. 创建功能分支（命名规范见下方）
git checkout -b feature/你的功能名

# 3. 开发功能，频繁提交
git add .
git commit -m "feat: 添加用户搜索功能"

# 4. 推送到远程
git push origin feature/你的功能名

# 5. 在 GitHub 上创建 Pull Request
# 6. 等待代码审查和合并
```

### 分支命名规范

- **功能开发**：`feature/功能描述`
  - 示例：`feature/user-search`、`feature/export-excel`
  
- **Bug 修复**：`bugfix/问题描述`
  - 示例：`bugfix/audio-playback`、`bugfix/date-filter`
  
- **热修复**（紧急）：`hotfix/问题描述`
  - 示例：`hotfix/login-crash`
  
- **文档更新**：`docs/内容描述`
  - 示例：`docs/api-guide`

### 小团队快速协作模式（可选）

如果团队规模小（2-3人）且沟通顺畅，可以直接在 `main` 分支协作：

```bash
# 开始工作前先拉取
git pull origin main

# 编写代码...

# 提交并推送
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

**注意**：这种模式需要团队成员之间频繁沟通，避免同时编辑同一文件。

---

## 📝 代码规范

### Commit 提交规范

使用约定式提交（Conventional Commits）：

```
<类型>: <简短描述>

[可选的详细描述]

[可选的脚注]
```

**提交类型**：

- `feat`: 新功能
  - `feat: 添加按学科筛选功能`
  
- `fix`: Bug 修复
  - `fix: 修复音频播放器崩溃问题`
  
- `docs`: 文档更新
  - `docs: 更新 API 使用说明`
  
- `style`: 代码格式调整（不影响逻辑）
  - `style: 统一代码缩进`
  
- `refactor`: 代码重构
  - `refactor: 优化数据获取逻辑`
  
- `test`: 测试相关
  - `test: 添加表单验证测试`
  
- `chore`: 构建/工具配置
  - `chore: 更新依赖版本`

**示例**：

```bash
git commit -m "feat: 添加批量删除功能"
git commit -m "fix: 修复日期筛选器时区问题"
git commit -m "docs: 更新 CONTRIBUTING.md"
```

### TypeScript 规范

- ✅ 使用明确的类型定义，避免 `any`
- ✅ 为组件 props 定义接口
- ✅ 使用类型推断减少冗余声明

```typescript
// ✅ 好的示例
interface BadcaseFormProps {
  initialValues?: Partial<Badcase>;
  onSubmit: (values: Badcase) => Promise<void>;
}

// ❌ 不好的示例
function handleData(data: any) { ... }
```

### React 规范

- ✅ 使用函数组件和 Hooks
- ✅ 合理拆分组件，保持单一职责
- ✅ 使用 `useMemo` 和 `useCallback` 优化性能

### 代码风格

运行代码检查：

```bash
npm run lint
```

---

## 🌿 Git 工作流

### 日常开发流程

```bash
# 1. 更新本地代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/my-feature

# 3. 编写代码并测试
npm run dev

# 4. 提交更改
git add .
git commit -m "feat: 添加新功能"

# 5. 推送到远程
git push origin feature/my-feature

# 6. 在 GitHub 创建 Pull Request
```

### 处理代码冲突

如果推送时遇到冲突：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 如果有冲突，Git 会提示冲突文件
# 打开冲突文件，查找 <<<<<<< 标记

# 3. 手动解决冲突后
git add .
git commit -m "chore: 合并冲突"

# 4. 重新推送
git push origin feature/my-feature
```

### Pull Request 流程

1. **创建 PR**：
   - 在 GitHub 上点击 "New Pull Request"
   - 选择你的分支 → `main`
   - 填写 PR 标题和描述

2. **描述模板**：
   ```markdown
   ## 功能描述
   简要说明这个 PR 做了什么
   
   ## 变更内容
   - 添加了 XX 功能
   - 修复了 XX 问题
   - 优化了 XX 性能
   
   ## 测试
   - [ ] 本地测试通过
   - [ ] 无控制台错误
   - [ ] UI 显示正常
   
   ## 截图（如有 UI 变更）
   [附上截图]
   ```

3. **代码审查**：
   - 等待团队成员审查
   - 根据反馈修改代码
   - 审查通过后合并

### 同步远程更改

保持你的分支与 `main` 同步：

```bash
# 切换到 main 分支
git checkout main
git pull origin main

# 切换回功能分支
git checkout feature/my-feature

# 合并 main 的最新更改
git merge main

# 或使用 rebase（保持历史线性）
git rebase main
```

---

## ❓ 常见问题

### Q1: 如何获取 Supabase 配置？

**答**：联系项目负责人获取，或查看团队共享文档。不要在代码中硬编码或提交到 Git！

### Q2: 推送时提示"权限被拒绝"？

**答**：确保你已被添加为仓库协作者。联系项目负责人 @Camelia-star-98 添加权限。

### Q3: 如何撤销错误的提交？

**答**：
```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）⚠️ 慎用
git reset --hard HEAD~1
```

### Q4: 不小心提交了敏感信息怎么办？

**答**：
1. 立即联系项目负责人
2. 更换泄露的密钥（如 Supabase Key）
3. 使用 `git reset` 或 `git revert` 移除敏感信息
4. 强制推送（需要权限）：`git push --force`

### Q5: 如何更新本地分支？

**答**：
```bash
# 在当前分支上拉取并合并
git pull origin main

# 或者分步操作
git fetch origin
git merge origin/main
```

### Q6: 多个人同时编辑同一文件怎么办？

**答**：
- 开发前先 `git pull` 获取最新代码
- 频繁提交，缩短冲突窗口
- 如果冲突，手动解决后提交
- 使用分支隔离不同功能

### Q7: 如何查看项目最新动态？

**答**：
```bash
# 查看提交历史
git log --oneline --graph --all

# 查看某个文件的变更历史
git log --follow -- src/components/MyComponent.tsx

# 查看某次提交的详细内容
git show <commit-hash>
```

---

## 📞 联系方式

- **项目负责人**：@Camelia-star-98
- **GitHub 仓库**：https://github.com/Camelia-star-98/voice-badcase-platform
- **问题反馈**：GitHub Issues
- **团队沟通**：[填写你们的沟通渠道，如钉钉群、微信群等]

---

## 📚 相关文档

- 📘 [README.md](./README.md) - 项目简介
- 📘 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - 数据库配置
- 🤖 [DINGTALK_INTEGRATION.md](./DINGTALK_INTEGRATION.md) - 钉钉集成
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南

---

## 🎯 开发建议

1. **代码提交前**：
   - ✅ 运行 `npm run lint` 检查代码
   - ✅ 本地测试功能正常
   - ✅ 检查控制台无错误
   - ✅ 编写清晰的 commit message

2. **代码审查时**：
   - 🧐 检查代码逻辑是否合理
   - 🧐 确认没有引入新的 Bug
   - 🧐 查看代码风格是否统一
   - 🧐 提出建设性的改进建议

3. **遇到问题时**：
   - 🔍 先查看文档和已有 Issues
   - 🔍 在团队群里询问
   - 🔍 在 GitHub 创建 Issue 详细描述问题

---

## ✅ 检查清单

在提交代码前，确认：

- [ ] 代码在本地运行正常
- [ ] 已运行 `npm run lint` 且无错误
- [ ] 已测试新增/修改的功能
- [ ] Commit message 符合规范
- [ ] 没有提交敏感信息（密钥、密码等）
- [ ] 没有提交不必要的文件（`node_modules`、`.env` 等）
- [ ] 如有 UI 变更，已在不同浏览器测试

---

**感谢你的贡献！🎉**

有任何问题或建议，欢迎随时联系团队。让我们一起把项目做得更好！


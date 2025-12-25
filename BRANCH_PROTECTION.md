# 🔒 GitHub 分支保护配置指南

为了确保代码质量和团队协作的顺畅，建议为主分支设置保护规则。

## 📋 目录

- [为什么需要分支保护](#为什么需要分支保护)
- [推荐配置](#推荐配置)
- [配置步骤](#配置步骤)
- [不同团队规模的建议](#不同团队规模的建议)

---

## 🤔 为什么需要分支保护

分支保护可以：

- ✅ 防止直接推送到主分支，降低破坏性改动的风险
- ✅ 强制代码审查，提高代码质量
- ✅ 要求测试通过后才能合并
- ✅ 保持提交历史清晰
- ✅ 新手友好，减少误操作

---

## ⚙️ 推荐配置

### 小型团队（2-5人）- 基础配置

适合快速迭代、团队信任度高的场景：

- ✅ **要求 Pull Request 审查**（至少 1 人）
- ⚠️ **允许管理员绕过**（紧急修复时使用）
- ❌ 不要求状态检查（初期没有 CI/CD）

### 中型团队（5-15人）- 标准配置

适合有一定规模、需要更严格流程的团队：

- ✅ **要求 Pull Request 审查**（至少 1-2 人）
- ✅ **要求状态检查通过**（如果配置了 CI/CD）
- ✅ **要求分支为最新**（合并前需要更新）
- ⚠️ **限制谁可以推送**（只有核心成员）

### 大型团队（15+人）- 严格配置

适合复杂项目、多团队协作：

- ✅ **要求 Pull Request 审查**（至少 2 人）
- ✅ **要求代码所有者审查**（特定模块由负责人审查）
- ✅ **要求所有对话解决**（强制解决所有评论）
- ✅ **要求状态检查通过**（CI/CD 测试、Lint 等）
- ✅ **要求分支为最新**
- ✅ **限制推送权限**

---

## 🛠️ 配置步骤

### 1. 进入仓库设置

1. 打开你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Branches**（分支）

### 2. 添加分支保护规则

1. 点击 **Add branch protection rule**
2. 在 **Branch name pattern** 输入：`main`

### 3. 配置保护选项（推荐设置）

#### ✅ 基础保护（必选）

```
☑️ Require a pull request before merging
   ☑️ Require approvals (设置为 1)
   ☐ Dismiss stale pull request approvals when new commits are pushed
   ☐ Require review from Code Owners
```

这将强制：
- 不能直接推送到 `main`
- 必须创建 Pull Request
- 至少需要 1 人审查批准

#### ⚙️ 进阶选项（可选）

**状态检查**（如果你配置了 CI/CD）：
```
☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   - 添加你的 CI/CD 检查项（如 "build", "test", "lint"）
```

**限制推送**（可选）：
```
☑️ Restrict who can push to matching branches
   - 添加可以推送的团队或成员
```

**其他设置**：
```
☑️ Allow force pushes (谨慎开启！仅管理员或紧急情况)
☐ Allow deletions (不推荐)
```

### 4. 保存规则

点击页面底部的 **Create** 或 **Save changes**

---

## 👥 不同团队规模的建议

### 🟢 2-3 人小团队

**配置**：
- Require 1 approval
- 允许管理员绕过规则

**工作流**：
```bash
# 功能开发
git checkout -b feature/new-feature
git push origin feature/new-feature

# 在 GitHub 创建 PR，简单 review 后合并
```

**优点**：
- 灵活快速
- 保持基本代码审查
- 紧急情况可以快速处理

---

### 🟡 4-8 人中型团队

**配置**：
- Require 1-2 approvals
- 分支需要最新才能合并
- 可选：添加 CI/CD 状态检查

**工作流**：
```bash
# 功能开发
git checkout -b feature/user-auth
git push origin feature/user-auth

# 创建 PR，描述清楚改动
# 等待至少 1 人审查
# 合并前确保分支是最新的
```

**优点**：
- 保证代码质量
- 减少冲突
- 团队知识共享

---

### 🔴 9+ 人大型团队

**配置**：
- Require 2+ approvals
- 要求 CODEOWNERS 审查
- 必须通过所有状态检查
- 限制推送权限

**工作流**：
```bash
# 创建详细的功能分支
git checkout -b feature/payment-integration

# 开发完成后，创建详细的 PR
# 附上测试结果、截图等
# 等待相关负责人审查
# 通过 CI/CD 后才能合并
```

**优点**：
- 严格的代码质量控制
- 清晰的职责划分
- 降低生产环境风险

---

## 📝 配置示例

### 示例 1：初创团队（2-3人）

```yaml
分支：main
要求：
  ✅ Require pull request (1 approval)
  ✅ Allow force pushes for administrators
  ❌ Require status checks
  ❌ Restrict pushes
```

### 示例 2：成熟项目（5+人）

```yaml
分支：main
要求：
  ✅ Require pull request (1-2 approvals)
  ✅ Require status checks:
     - build
     - test
     - lint
  ✅ Require branch up to date
  ✅ Restrict who can push (仅核心团队)
  ❌ Allow force pushes
```

---

## ⚠️ 常见问题

### Q1: 配置后如何紧急修复线上 Bug？

**方案 A**：通过 Hotfix PR（推荐）
```bash
git checkout -b hotfix/critical-bug
# 修复 bug
git push origin hotfix/critical-bug
# 创建 PR，标记为紧急，快速审查合并
```

**方案 B**：临时解除保护（慎用）
1. Settings → Branches → 编辑规则
2. 临时取消保护
3. 直接推送修复
4. **立即恢复保护规则**

### Q2: 如何处理"分支不是最新"的错误？

```bash
# 在你的功能分支上
git checkout feature/my-feature
git fetch origin
git merge origin/main

# 或使用 rebase（保持历史线性）
git rebase origin/main

# 解决冲突后推送
git push origin feature/my-feature
```

### Q3: 如何撤销错误合并的 PR？

```bash
# 创建一个 revert PR
git checkout main
git pull origin main
git revert <commit-hash>
git push origin revert-fix

# 创建 PR 合并这个 revert
```

### Q4: 能否让某些成员绕过保护？

可以，但不推荐。更好的做法是：
- 保持规则统一
- 紧急情况使用 hotfix 流程
- 提高 review 速度而不是绕过规则

---

## 🎯 最佳实践

1. **逐步启用**：先用基础保护，团队适应后再加严
2. **保持灵活**：根据实际情况调整规则
3. **及时 Review**：不要让 PR 积压太久
4. **清晰描述**：PR 中说明改动内容和原因
5. **自动化测试**：配合 CI/CD 提高效率

---

## 🔗 相关资源

- [GitHub 分支保护官方文档](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [团队协作指南](./CONTRIBUTING.md)
- [Pull Request 最佳实践](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)

---

## 📞 需要帮助？

如有配置问题，请联系：
- **项目负责人**：@Camelia-star-98
- **GitHub Issues**：https://github.com/Camelia-star-98/voice-badcase-platform/issues

---

**记住**：分支保护是为了帮助团队，而不是制造障碍。根据实际情况灵活调整！ 🚀


# Pull Request 检查清单

在提交PR之前，请确保：

## ✅ 代码质量检查

- [ ] 代码可以本地成功构建（`npm run build`）
- [ ] 没有TypeScript错误
- [ ] 没有ESLint警告
- [ ] 所有导入的函数都被使用

## ✅ 配置文件检查

### vercel.json
- [ ] **不要配置多区域部署** `regions`（免费版不支持）
- [ ] 不要配置serverless functions（如果是纯前端项目）
- [ ] 检查buildCommand和outputDirectory是否正确

### 正确的vercel.json示例：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ❌ 错误配置示例：
```json
{
  "regions": ["hkg1", "sin1"],  // ❌ 多区域需要付费
  "functions": { ... }           // ❌ 如果不需要serverless functions
}
```

## ✅ 文件冲突检查

- [ ] 没有 `.js` 和 `.ts` 同名文件冲突
- [ ] 检查是否有重复的路由或API端点

## ✅ 部署前测试

1. **本地构建测试：**
   ```bash
   npm run build
   npm run preview
   ```

2. **检查构建产物：**
   ```bash
   ls -la dist/
   ```

3. **提交前检查Git状态：**
   ```bash
   git status
   git diff
   ```

## ✅ 提交信息规范

- [ ] 提交信息清晰描述改动内容
- [ ] 使用约定式提交格式（如：`feat:`, `fix:`, `style:`）

## 📋 审查清单（给审查者）

作为代码审查者，在合并PR前检查：

1. **查看Vercel部署状态**
   - ✅ 必须显示绿色"Ready"
   - ❌ 如果显示红色"Failed"，不要合并

2. **查看Files changed**
   - 确认没有意外的配置文件改动
   - 检查是否删除了重要文件

3. **测试预览环境**
   - 点击Vercel的预览链接测试功能
   - 确认没有破坏现有功能

## 🚨 常见错误及解决方案

### 错误1：多区域部署
```
Deploying Serverless Functions to multiple regions is restricted to Pro and Enterprise plans.
```
**解决：** 删除 `vercel.json` 中的 `"regions"` 配置

### 错误2：文件路径冲突
```
Two or more files have conflicting paths or names
```
**解决：** 检查是否有 `.js` 和 `.ts` 同名文件，删除其中一个

### 错误3：TypeScript编译错误
```
error TS6133: 'xxx' is declared but its value is never read
```
**解决：** 删除未使用的导入或变量

## 📞 需要帮助？

如果遇到问题，请：
1. 先查看Vercel的Build Logs完整错误信息
2. 搜索错误信息找解决方案
3. 向团队求助时附上完整的错误日志

---

**记住：先在本地构建成功，再提交PR！**

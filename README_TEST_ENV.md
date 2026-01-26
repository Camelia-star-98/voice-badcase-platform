# 🚀 快速开始 - 测试环境

## ⚡ 3步快速设置

### 第1步：运行设置助手
```bash
cd /Users/yanglurui/voice-badcase-platform
./setup-test-env.sh
```

按照提示完成配置。

### 第2步：启动测试环境
```bash
./start-test-env.sh
```

### 第3步：访问平台
```
http://localhost:5173
```

---

## 🔒 安全保证

- ✅ **完全隔离**：使用独立的 Supabase 测试项目
- ✅ **自动保护**：启动脚本自动切换到测试环境
- ✅ **不会误操作**：绝对不会修改正式数据库

---

## 📋 详细文档

- **完整设置指南**：`SETUP_TEST_ENV.md`
- **功能验证指南**：`VERIFY_PRIORITY_FEATURE.md`

---

## ⚠️ 重要提示

**始终使用 `./start-test-env.sh` 启动，不要直接运行 `npm run dev`！**

这样可以确保：
- ✅ 自动切换到测试环境
- ✅ 不会意外连接生产数据库
- ✅ 安全标记保护

---

**祝你使用愉快！** 🎉






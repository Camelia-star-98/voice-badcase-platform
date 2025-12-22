# 🚀 快速开始指南

## 5分钟快速启动

### 前置条件

- ✅ Node.js 18+ 已安装
- ✅ PostgreSQL 14+ 已安装并运行

### 第1步：进入项目目录

```bash
cd /Users/ailian/Downloads/voice-badcase-platform
```

### 第2步：安装依赖

```bash
npm install
```

⏱️ 预计耗时：1-2分钟

### 第3步：创建数据库

```bash
# macOS/Linux
createdb voice_badcase

# 或使用psql
psql -U postgres -c "CREATE DATABASE voice_badcase;"
```

### 第4步：配置数据库连接

编辑 `server/index.js` 第18-24行：

```javascript
const pool = new Pool({
  user: 'postgres',           // 👈 修改为你的用户名
  host: 'localhost',
  database: 'voice_badcase',
  password: 'your_password',  // 👈 修改为你的密码
  port: 5432,
})
```

### 第5步：启动服务

#### 方式A：使用启动脚本（推荐）

```bash
./start.sh
```

#### 方式B：手动启动

**终端1 - 启动后端：**
```bash
npm run server
```

等待看到：
```
数据库表初始化成功
服务器运行在 http://localhost:3000
```

**终端2 - 启动前端：**
```bash
npm run dev
```

等待看到：
```
➜ Local: http://localhost:5173/
```

### 第6步：访问应用

打开浏览器访问：**http://localhost:5173**

🎉 **恭喜！平台已启动成功！**

---

## 可选：插入测试数据

```bash
node server/mock-data.js
```

成功后会看到：
```
开始插入模拟数据...
成功插入 16 条数据
```

刷新浏览器页面即可看到测试数据。

---

## 🎯 功能快速导航

### 1. 新建问题

点击右上角 **"新建问题"** 按钮

必填字段：
- 问题文本
- 问题描述
- 修复优先级
- 问题状态

### 2. 搜索问题

在顶部搜索框输入关键词，实时搜索问题文本

### 3. 过滤数据

使用下拉菜单：
- **问题状态**：修复中、待确认、已上线并验证、已关闭、停顿
- **修复优先级**：P00、P0、P1、P2
- **日期范围**：选择反馈日期范围

### 4. 播放音频

点击音频列的 🔵 播放按钮

### 5. 编辑记录

点击操作列的 **"编辑"** 按钮

---

## 🛠️ 常见问题

### ❌ 数据库连接失败

**错误信息**：
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**：
1. 检查PostgreSQL是否启动：
   ```bash
   # macOS
   brew services list
   
   # 如果未启动
   brew services start postgresql
   ```

2. 验证连接配置是否正确

### ❌ 端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

查找并杀死占用进程：
```bash
# 查找占用3000端口的进程
lsof -i :3000

# 杀死进程（替换PID为实际进程ID）
kill -9 PID
```

或修改端口配置。

### ❌ npm install 失败

**解决方案**：

```bash
# 清除缓存
npm cache clean --force

# 使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### ❌ 前端页面空白

**解决方案**：

1. 检查浏览器控制台错误
2. 确认后端服务已启动
3. 验证API代理配置

---

## 📝 下一步

- 📖 阅读 [README.md](./README.md) 了解详细功能
- 🚀 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 学习部署方法
- 📊 查看 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) 了解架构设计

---

## 💡 小贴士

1. **数据持久化**：所有数据保存在PostgreSQL数据库中，重启服务不会丢失

2. **音频文件**：可以直接输入音频URL，或通过上传接口上传文件

3. **搜索技巧**：搜索支持模糊匹配，多个条件会同时生效

4. **表格操作**：
   - 点击列标题可排序
   - 拖动列边界可调整列宽
   - 鼠标悬停查看完整内容

5. **键盘快捷键**：
   - `Ctrl/Cmd + C`：停止服务
   - `Ctrl/Cmd + R`：刷新页面

---

## 🆘 获取帮助

遇到问题？

1. 检查终端错误信息
2. 查看浏览器控制台
3. 阅读 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)（如果有）
4. 提交Issue

---

**祝使用愉快！** 🎉


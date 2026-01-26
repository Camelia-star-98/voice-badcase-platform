# 📦 安装 Node.js 指南

## 问题原因
你的电脑上没有安装 Node.js，所以找不到 `npm` 命令。

---

## 🎯 方法1：使用官方安装包（推荐，最简单）

### 步骤1：下载 Node.js

1. **访问 Node.js 官网**
   ```
   https://nodejs.org/
   ```

2. **下载 LTS 版本**
   - 点击绿色的 **"LTS"** 按钮（推荐版本）
   - 会自动下载 macOS 安装包（.pkg 文件）

### 步骤2：安装

1. **打开下载的文件**
   - 在"下载"文件夹中找到 `.pkg` 文件
   - 双击打开

2. **按照安装向导操作**
   - 点击"继续"
   - 接受许可协议
   - 点击"安装"
   - 输入你的 Mac 密码
   - 等待安装完成

### 步骤3：验证安装

1. **关闭当前终端，重新打开一个新终端**

2. **验证 Node.js 和 npm**
   ```bash
   node --version
   npm --version
   ```

   应该看到版本号，例如：
   ```
   v20.10.0
   10.2.3
   ```

---

## 🎯 方法2：使用 Homebrew（如果你已安装 Homebrew）

### 步骤1：检查是否已安装 Homebrew

```bash
brew --version
```

如果显示版本号，说明已安装，跳到步骤2。
如果显示 `command not found`，需要先安装 Homebrew。

### 步骤2：安装 Node.js

```bash
brew install node
```

### 步骤3：验证安装

```bash
node --version
npm --version
```

---

## ✅ 安装完成后

安装完成后，回到项目目录，重新运行启动脚本：

```bash
cd /Users/yanglurui/voice-badcase-platform
./立即启动.sh
```

或者手动执行：

```bash
cd /Users/yanglurui/voice-badcase-platform
npm install
npm run dev
```

---

## 🐛 如果安装后还是找不到命令

### 解决方法1：重新打开终端

关闭当前终端窗口，重新打开一个新终端。

### 解决方法2：检查 PATH

```bash
echo $PATH
```

确认是否包含 Node.js 的路径（通常在 `/usr/local/bin` 或 `/opt/homebrew/bin`）

### 解决方法3：手动添加到 PATH

编辑 `~/.zshrc` 文件：

```bash
nano ~/.zshrc
```

添加以下行（如果不存在）：

```bash
export PATH="/usr/local/bin:$PATH"
```

保存后执行：

```bash
source ~/.zshrc
```

---

## 📋 快速检查清单

- [ ] ✅ 已下载 Node.js 安装包
- [ ] ✅ 已安装 Node.js
- [ ] ✅ 已重新打开终端
- [ ] ✅ `node --version` 显示版本号
- [ ] ✅ `npm --version` 显示版本号

---

## 🎉 完成！

安装完成后，你就可以使用 npm 命令了！

**下一步：**
1. 安装 Node.js
2. 重新打开终端
3. 运行 `./立即启动.sh` 或 `npm install && npm run dev`






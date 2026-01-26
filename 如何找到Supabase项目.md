# 🔍 如何在 Supabase Dashboard 中找到项目

## 📍 步骤说明

### 第1步：登录 Supabase Dashboard

1. **打开浏览器**
2. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```
3. **登录你的账号**
   - 如果没有账号，点击 "Sign Up" 注册
   - 如果有账号，点击 "Sign In" 登录

---

### 第2步：找到项目列表

登录成功后，你会看到：

#### 方式1：项目列表页面（默认）

- 页面会显示你所有的 Supabase 项目
- 每个项目显示为一个卡片或列表项
- 项目卡片上会显示：
  - **项目名称**（Project Name）
  - **项目 URL**（类似：`mcpyilgpotajpmgblorc.supabase.co`）
  - **创建时间**
  - **区域**（Region）

#### 方式2：通过项目 URL 识别

你的项目 URL 是：`https://mcpyilgpotajpmgblorc.supabase.co`

在项目列表中，找到 URL 中包含 `mcpyilgpotajpmgblorc` 的项目。

**项目 URL 格式：**
- `https://mcpyilgpotajpmgblorc.supabase.co`
- 其中 `mcpyilgpotajpmgblorc` 就是项目 ID

---

### 第3步：选择项目

1. **在项目列表中找到项目**
   - 查看项目名称或 URL
   - 找到包含 `mcpyilgpotajpmgblorc` 的项目

2. **点击项目卡片**
   - 点击项目卡片或项目名称
   - 进入项目详情页面

---

## 🎯 如果找不到项目

### 可能的原因：

1. **登录了错误的账号**
   - 确认你登录的是创建项目的账号
   - 或者项目是别人创建的，需要邀请你

2. **项目被删除**
   - 检查项目是否还存在
   - 联系项目创建者

3. **项目在组织（Organization）中**
   - 如果项目在组织下，需要先选择组织
   - 点击左侧的组织切换器

---

## 📸 界面说明

### Supabase Dashboard 布局：

```
┌─────────────────────────────────────┐
│  Supabase Logo    [Settings] [User] │
├─────────────────────────────────────┤
│                                     │
│  📁 Projects（项目列表）            │
│                                     │
│  ┌─────────────┐  ┌─────────────┐ │
│  │ Project 1   │  │ Project 2   │ │
│  │ name: xxx   │  │ name: xxx   │ │
│  │ URL: ...    │  │ URL: ...    │ │
│  └─────────────┘  └─────────────┘ │
│                                     │
│  [+ New Project]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔍 快速查找方法

### 方法1：通过项目名称查找

如果你记得项目名称：
- 在项目列表中查找项目名称
- 点击进入

### 方法2：通过 URL 查找

如果你知道项目 URL：
- 在项目列表中查找 URL 中包含 `mcpyilgpotajpmgblorc` 的项目
- 项目 URL 通常显示在项目卡片上

### 方法3：通过搜索（如果有搜索功能）

- 在 Dashboard 顶部可能有搜索框
- 输入 `mcpyilgpotajpmgblorc` 搜索

---

## 📋 项目信息确认

找到项目后，确认以下信息：

- ✅ **项目名称**：可能是 `voice-badcase-platform` 或其他名称
- ✅ **项目 URL**：`https://mcpyilgpotajpmgblorc.supabase.co`
- ✅ **项目状态**：应该是 "Active"（活跃）

---

## 🆘 如果还是找不到

### 检查1：确认账号

1. **检查当前登录的账号**
   - 点击右上角头像
   - 查看账号信息
   - 确认是否是创建项目的账号

### 检查2：检查组织

1. **查看是否有组织切换器**
   - 在左侧菜单顶部
   - 如果有下拉菜单，切换不同的组织查看

### 检查3：创建新项目（如果找不到）

如果确实找不到，可能需要创建新项目：

1. **点击 "New Project" 按钮**
2. **填写项目信息**：
   - Project Name: `voice-badcase-platform`
   - Database Password: 设置密码
   - Region: 选择区域
3. **创建项目**
4. **获取新的项目 URL 和 Key**
5. **更新 `.env.local` 文件**

---

## 💡 提示

**项目 URL 中的 ID：**
- `mcpyilgpotajpmgblorc` 是项目的唯一标识符
- 每个 Supabase 项目都有唯一的 ID
- 这个 ID 会出现在项目 URL 中

**如何确认找到了正确的项目：**
1. 点击项目进入详情页
2. 点击 **Settings** → **API**
3. 查看 **Project URL**，应该显示：
   ```
   https://mcpyilgpotajpmgblorc.supabase.co
   ```

---

## 🎯 下一步

找到项目后：

1. **点击项目进入详情页**
2. **点击左侧菜单 "SQL Editor"**
3. **点击 "New query"**
4. **执行数据库迁移脚本**

---

**如果还是找不到，告诉我你的情况，我可以帮你进一步排查！** 🔍


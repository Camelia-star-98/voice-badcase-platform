# 🧪 测试环境配置指南

## 📋 方案概述

为了安全地验证新功能而不影响生产数据，我们提供两种方案：

### 方案1：创建新的 Supabase 测试项目（推荐）⭐
- ✅ 完全隔离，不影响生产数据
- ✅ 可以随意测试，不怕数据丢失
- ✅ 可以随时删除重建

### 方案2：使用测试表（badcases_test）
- ✅ 使用同一个 Supabase 项目
- ✅ 不需要创建新项目
- ⚠️ 需要小心不要误操作生产表

---

## 🎯 方案1：创建新的 Supabase 测试项目（推荐）

### 步骤1：创建测试项目

1. **登录 Supabase**
   - 访问：https://supabase.com/dashboard
   - 点击 **"New Project"**

2. **填写项目信息**
   - **Project Name**: `voice-badcase-platform-test`（或任意名称）
   - **Database Password**: 设置密码（记住它）
   - **Region**: 选择任意区域
   - **Pricing Plan**: 选择 Free（免费版足够测试）

3. **等待项目创建完成**（约1-2分钟）

### 步骤2：初始化测试数据库

1. **执行基础表创建脚本**
   - 在测试项目的 SQL Editor 中
   - 执行 `database/create_badcases_table.sql`
   - 这会创建基础的 `badcases` 表

2. **执行优先级字段迁移脚本**
   - 执行 `database/add_priority_column.sql`
   - 这会添加 `priority` 字段

### 步骤3：配置测试环境变量

在项目根目录创建 `.env.local.test` 文件：

```bash
# 测试环境配置
VITE_SUPABASE_URL=https://你的测试项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的测试项目anon key
```

**如何获取测试项目的配置：**
1. 在 Supabase Dashboard 中选择测试项目
2. 点击 **Settings** → **API**
3. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 步骤4：修改启动脚本使用测试环境

创建测试启动脚本 `test-dev.sh`：

```bash
#!/bin/bash
# 测试环境启动脚本

# 备份原有的 .env.local（如果存在）
if [ -f .env.local ]; then
  cp .env.local .env.local.backup
  echo "✅ 已备份原有 .env.local"
fi

# 使用测试环境配置
if [ -f .env.local.test ]; then
  cp .env.local.test .env.local
  echo "✅ 已切换到测试环境配置"
else
  echo "❌ 错误：.env.local.test 文件不存在"
  echo "请先创建测试环境配置文件"
  exit 1
fi

# 启动开发服务器
echo "🚀 启动测试环境开发服务器..."
npm run dev
```

**使用方法：**
```bash
chmod +x test-dev.sh
./test-dev.sh
```

### 步骤5：恢复生产环境

测试完成后，恢复生产环境：

```bash
# 恢复原有的 .env.local
if [ -f .env.local.backup ]; then
  mv .env.local.backup .env.local
  echo "✅ 已恢复生产环境配置"
fi
```

---

## 🎯 方案2：使用测试表（badcases_test）

### 步骤1：创建测试表

在 Supabase SQL Editor 中执行：

```sql
-- 创建测试表（复制生产表结构）
CREATE TABLE IF NOT EXISTS public.badcases_test (
    -- 主键
    id TEXT PRIMARY KEY,
    
    -- 基本信息
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- 分类和状态
    subject TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',  -- 包含优先级字段
    
    -- 位置信息
    location TEXT,
    full_tts_lesson_id TEXT,
    cms_id TEXT,
    
    -- 人员和时间
    reporter TEXT,
    expected_fix_date TEXT,
    
    -- 附加信息
    audio_url TEXT,
    video_url TEXT,
    model_id TEXT,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_badcases_test_date ON public.badcases_test(date);
CREATE INDEX IF NOT EXISTS idx_badcases_test_status ON public.badcases_test(status);
CREATE INDEX IF NOT EXISTS idx_badcases_test_category ON public.badcases_test(category);
CREATE INDEX IF NOT EXISTS idx_badcases_test_subject ON public.badcases_test(subject);
CREATE INDEX IF NOT EXISTS idx_badcases_test_priority ON public.badcases_test(priority);
CREATE INDEX IF NOT EXISTS idx_badcases_test_created_at ON public.badcases_test(created_at DESC);

-- 启用 RLS
ALTER TABLE public.badcases_test ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略
CREATE POLICY "允许所有人查看 badcases_test"
ON public.badcases_test FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "允许所有人插入 badcases_test"
ON public.badcases_test FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "允许所有人更新 badcases_test"
ON public.badcases_test FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "允许所有人删除 badcases_test"
ON public.badcases_test FOR DELETE TO anon, authenticated USING (true);

-- 启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.badcases_test;
```

### 步骤2：修改代码使用测试表

创建一个测试版本的 API 文件 `src/api/badcaseApi.test.ts`：

```typescript
import { supabase } from './supabase';
import { BadcaseData } from '../types';

// 使用测试表名
const TABLE_NAME = 'badcases_test';  // 改为测试表

// ... 其他代码保持不变，只需要把 'badcases' 替换为 'badcases_test'
```

或者更简单的方法：修改 `src/api/supabase.ts`，添加环境变量控制：

```typescript
// 在 supabase.ts 中添加
const TABLE_NAME = import.meta.env.VITE_TEST_MODE === 'true' 
  ? 'badcases_test' 
  : 'badcases';
```

然后在 `.env.local.test` 中添加：
```
VITE_TEST_MODE=true
```

---

## 🔄 快速切换脚本

创建一个更智能的切换脚本 `switch-env.sh`：

```bash
#!/bin/bash

ENV_TYPE=$1

if [ "$ENV_TYPE" == "test" ]; then
  if [ -f .env.local.test ]; then
    cp .env.local.test .env.local
    echo "✅ 已切换到测试环境"
  else
    echo "❌ 错误：.env.local.test 文件不存在"
    exit 1
  fi
elif [ "$ENV_TYPE" == "prod" ]; then
  if [ -f .env.local.prod ]; then
    cp .env.local.prod .env.local
    echo "✅ 已切换到生产环境"
  else
    echo "❌ 错误：.env.local.prod 文件不存在"
    exit 1
  fi
else
  echo "用法: ./switch-env.sh [test|prod]"
  exit 1
fi
```

**使用方法：**
```bash
chmod +x switch-env.sh
./switch-env.sh test   # 切换到测试环境
./switch-env.sh prod   # 切换回生产环境
```

---

## 📝 推荐工作流程

### 日常开发测试

1. **切换到测试环境**
   ```bash
   ./switch-env.sh test
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **验证功能**
   - 在测试环境中随意测试
   - 不用担心数据丢失或影响生产

4. **测试完成后切换回生产环境**
   ```bash
   ./switch-env.sh prod
   ```

---

## ⚠️ 注意事项

1. **不要提交测试配置文件**
   - `.env.local.test` 应该添加到 `.gitignore`
   - 不要提交包含真实密钥的文件

2. **定期清理测试数据**
   - 测试完成后可以删除测试项目
   - 或清空测试表数据

3. **保持测试环境与生产环境一致**
   - 测试环境的表结构应该与生产环境一致
   - 确保迁移脚本在两个环境都能正常工作

---

## 🎉 总结

**推荐使用方案1（新建测试项目）**，因为：
- ✅ 完全隔离，最安全
- ✅ 可以随意测试，不怕出错
- ✅ 测试完成后可以删除，不留痕迹

**如果不想创建新项目，使用方案2（测试表）**，但需要：
- ⚠️ 小心不要误操作生产表
- ⚠️ 记得在代码中切换表名

---

**祝你测试顺利！** 🚀






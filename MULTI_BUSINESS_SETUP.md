# 多业务方向功能说明

## 功能概述

平台现在支持两个独立的业务方向：
1. **Next方向** - Next业务线的Badcase管理
2. **风灵方向** - 风灵业务线的Badcase管理

每个业务方向拥有完全独立的数据表和数据存储，互不影响。

## 数据库配置

### 1. 执行SQL脚本

在 Supabase 控制台中执行以下SQL脚本以创建风灵业务的数据表：

```sql
-- 文件位置：database/add_fengling_table.sql
```

该脚本会：
- 创建 `badcases_fengling` 表（风灵业务方向）
- 为现有 `badcases` 表添加 `business` 字段（Next业务方向）
- 创建必要的索引以提高查询性能

### 2. 表结构

- **Next方向**：使用 `badcases` 表
- **风灵方向**：使用 `badcases_fengling` 表

两个表结构完全相同，包含以下字段：
- id, date, subject, location
- full_tts_lesson_id, cms_id, reporter
- category, expected_fix_date, status, priority
- description, audio_url, video_url, model_id
- created_at, updated_at

## 使用流程

### 1. 首页选择业务方向

用户访问首页后，会看到两个醒目的业务方向卡片：
- **Next方向**（紫色渐变）
- **风灵方向**（粉红渐变）

点击任一卡片进入对应业务的功能导航页。

### 2. 功能导航页

选择业务方向后，进入功能导航页，可以看到三个功能模块：
- **Badcase列表** - 查看和管理所有Badcase记录
- **流转状态** - 跟踪Badcase处理流程和状态
- **数据统计** - 查看多维度数据分析和报表

### 3. 数据隔离

- 每个业务方向的数据完全独立
- 在Supabase模式下，使用不同的数据表
- 在localStorage模式下，使用不同的存储键：
  - Next: `badcaseList_next`
  - 风灵: `badcaseList_fengling`

## 技术实现

### 路由结构

```
/home                              → 首页（业务方向选择）
/business-portal?business=next     → Next功能导航
/business-portal?business=fengling → 风灵功能导航
/badcase-list?business=next        → Next的Badcase列表
/badcase-list?business=fengling    → 风灵的Badcase列表
/status-flow?business=next         → Next的流转状态
/status-flow?business=fengling     → 风灵的流转状态
/data-dashboard?business=next      → Next的数据统计
/data-dashboard?business=fengling  → 风灵的数据统计
```

### Context API

`BadcaseContext` 现在支持：
- `currentBusiness`: 当前业务方向（'next' | 'fengling'）
- `setCurrentBusiness`: 切换业务方向
- 自动根据 `currentBusiness` 加载对应表的数据
- 自动订阅对应表的实时更新

### API层

所有 `badcaseApi` 函数现在接受可选的 `tableName` 参数：
- `getAllBadcases(tableName?)`
- `createBadcase(badcase, tableName?)`
- `updateBadcase(id, updates, tableName?)`
- `deleteBadcase(id, tableName?)`

## 左侧导航栏

左侧导航栏保持不变，继续指向通用路由：
- `/home` → 首页（业务方向选择）
- `/badcase-list` → 默认进入Next列表
- `/status-flow` → 默认进入Next流转
- `/data-dashboard` → 默认进入Next统计

如需访问风灵方向，需要从首页选择或直接在URL添加 `?business=fengling` 参数。

## 注意事项

1. **数据库迁移**：首次部署需要执行 `add_fengling_table.sql` 脚本
2. **权限配置**：确保Supabase RLS策略覆盖新表
3. **实时订阅**：每个业务方向有独立的Realtime订阅通道
4. **localStorage限制**：浏览器localStorage有5-10MB限制，建议配置Supabase

## 未来扩展

如需添加新的业务方向，只需：
1. 在数据库创建新表（如 `badcases_xxx`）
2. 在 `HomePage.tsx` 添加新的业务卡片
3. 在 `BusinessPortalPage.tsx` 的 `businessConfig` 添加配置
4. 在 `BadcaseContext.tsx` 的 `getTableName` 函数添加映射

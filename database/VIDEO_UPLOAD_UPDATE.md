# 视频上传功能 - 数据库更新指南

## 📋 概述

新增了视频文件上传功能，需要更新数据库表结构添加 `video_url` 字段。

## 🔧 执行步骤

### 1. 登录 Supabase Dashboard

访问你的 Supabase 项目：https://supabase.com/dashboard

### 2. 进入 SQL Editor

在左侧导航栏找到并点击 **SQL Editor**

### 3. 执行更新脚本

复制并执行以下脚本（或直接使用 `database/add_video_url_column.sql` 文件）：

```sql
-- 添加 video_url 字段
ALTER TABLE public.badcases 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 添加注释说明
COMMENT ON COLUMN public.badcases.video_url IS '视频文件URL，用于更直观地定位和分类问题';
```

### 4. 验证更新

执行以下查询验证字段已成功添加：

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'badcases' AND column_name = 'video_url';
```

## ✨ 新功能说明

### 前端功能

1. **上传视频文件**
   - 位置：新建 Badcase 表单
   - 支持格式：MP4、MOV、AVI、WebM 等常见视频格式
   - 文件大小：最大 50MB
   - 状态：可选上传

2. **视频播放**
   - 表格操作列：显示"视频"按钮（如有视频）
   - 详情页面：显示"播放视频"按钮（如有视频）
   - 播放器：弹窗式视频播放器

3. **操作按钮更新**
   - 表格操作列：
     - 📄 查看 - 查看详细信息
     - 🔊 音频 - 播放音频（如有）
     - 🎬 视频 - 播放视频（如有）

### 数据存储

- 视频文件通过 Base64 编码存储
- 存储在 `badcases` 表的 `video_url` 字段
- 可选字段，不影响现有功能

## 🎯 使用场景

视频上传功能主要用于：

1. **问题定位**：录制屏幕操作过程，准确展示问题发生场景
2. **问题分类**：通过视觉信息更准确地分类和理解问题
3. **沟通协作**：减少文字描述，提高问题沟通效率
4. **问题归档**：完整记录问题现场，便于后续回溯

## ⚠️ 注意事项

1. **文件大小限制**：
   - 音频文件：最大 10MB
   - 视频文件：最大 50MB
   - 建议压缩大文件以提升上传速度

2. **浏览器兼容性**：
   - 推荐使用 Chrome、Edge、Safari 最新版本
   - 确保浏览器支持 HTML5 video 标签

3. **性能优化**：
   - 视频使用 Base64 存储在数据库中
   - 大量视频可能影响数据库性能
   - 未来可考虑使用 Supabase Storage 存储文件

## 🚀 后续优化建议

1. **使用 Supabase Storage**
   - 将视频文件存储到 Supabase Storage
   - 只在数据库中保存文件 URL
   - 提升性能和可扩展性

2. **视频压缩**
   - 前端自动压缩视频文件
   - 减少上传时间和存储空间

3. **缩略图生成**
   - 自动生成视频缩略图
   - 在列表中预览视频内容

## 📝 更新日志

- **2024-12-24**：新增视频上传功能
  - 添加 `video_url` 字段到数据库
  - 前端支持视频文件上传
  - 添加视频播放器组件


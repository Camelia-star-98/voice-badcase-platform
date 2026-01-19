-- ========================================
-- 🔍 检查课节ID和模型ID缺失问题
-- ========================================
-- 这个脚本专门用于诊断为什么课节ID和模型ID显示为空
-- ========================================

-- 1️⃣ 检查表结构 - 确认字段是否存在
SELECT 
    '1️⃣ 检查字段是否存在' AS "检查项",
    column_name AS "字段名",
    data_type AS "数据类型",
    is_nullable AS "是否可空"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'badcases'
  AND column_name IN ('full_tts_lesson_id', 'cms_id', 'model_id')
ORDER BY column_name;

-- 2️⃣ 查看所有数据的ID字段情况
SELECT 
    '2️⃣ 所有数据的ID字段' AS "检查项",
    id AS "Badcase ID",
    subject AS "学科",
    location AS "出现位置",
    reporter AS "提报人",
    full_tts_lesson_id AS "全程TTS课节ID",
    cms_id AS "CMS课节ID", 
    model_id AS "问题模型ID",
    CASE 
        WHEN full_tts_lesson_id IS NULL OR full_tts_lesson_id = '' THEN '空'
        ELSE '有值'
    END AS "课节ID状态",
    CASE 
        WHEN model_id IS NULL OR model_id = '' THEN '空'
        ELSE '有值'
    END AS "模型ID状态",
    created_at AS "创建时间"
FROM public.badcases
ORDER BY created_at DESC;

-- 3️⃣ 统计ID字段的填写情况
SELECT 
    '3️⃣ ID字段统计' AS "检查项",
    COUNT(*) AS "总记录数",
    
    -- 全程TTS课节ID统计
    SUM(CASE WHEN full_tts_lesson_id IS NOT NULL AND full_tts_lesson_id != '' THEN 1 ELSE 0 END) AS "有全程TTS课节ID的数量",
    SUM(CASE WHEN full_tts_lesson_id IS NULL OR full_tts_lesson_id = '' THEN 1 ELSE 0 END) AS "缺全程TTS课节ID的数量",
    
    -- CMS课节ID统计
    SUM(CASE WHEN cms_id IS NOT NULL AND cms_id != '' THEN 1 ELSE 0 END) AS "有CMS课节ID的数量",
    SUM(CASE WHEN cms_id IS NULL OR cms_id = '' THEN 1 ELSE 0 END) AS "缺CMS课节ID的数量",
    
    -- 问题模型ID统计
    SUM(CASE WHEN model_id IS NOT NULL AND model_id != '' THEN 1 ELSE 0 END) AS "有问题模型ID的数量",
    SUM(CASE WHEN model_id IS NULL OR model_id = '' THEN 1 ELSE 0 END) AS "缺问题模型ID的数量"
FROM public.badcases;

-- 4️⃣ 列出所有缺失ID的记录详情
SELECT 
    '4️⃣ 缺失ID的记录' AS "检查项",
    id,
    reporter,
    subject,
    location,
    CASE 
        WHEN full_tts_lesson_id IS NULL THEN '❌ NULL'
        WHEN full_tts_lesson_id = '' THEN '❌ 空字符串'
        ELSE '✅ ' || full_tts_lesson_id
    END AS "全程TTS课节ID",
    CASE 
        WHEN cms_id IS NULL THEN '❌ NULL'
        WHEN cms_id = '' THEN '❌ 空字符串'
        ELSE '✅ ' || cms_id
    END AS "CMS课节ID",
    CASE 
        WHEN model_id IS NULL THEN '❌ NULL'
        WHEN model_id = '' THEN '❌ 空字符串'
        ELSE '✅ ' || model_id
    END AS "问题模型ID",
    created_at
FROM public.badcases
WHERE 
    (full_tts_lesson_id IS NULL OR full_tts_lesson_id = '')
    OR (cms_id IS NULL OR cms_id = '')
    OR (model_id IS NULL OR model_id = '')
ORDER BY created_at DESC;

-- 5️⃣ 显示完整数据（包括所有字段）
SELECT 
    '5️⃣ 完整数据' AS "检查项",
    *
FROM public.badcases
ORDER BY created_at DESC;

-- ========================================
-- 📋 诊断结果说明
-- ========================================
-- 
-- 如果看到：
-- ✅ 字段存在但数据为空 -> 说明创建记录时没有填写这些字段
-- ❌ 字段不存在 -> 需要运行 fix_all_missing_fields.sql 添加字段
-- 
-- 解决方案：
-- 1. 如果字段存在但为空 -> 编辑对应记录，填写缺失的ID
-- 2. 如果字段不存在 -> 运行 database/fix_all_missing_fields.sql
-- ========================================


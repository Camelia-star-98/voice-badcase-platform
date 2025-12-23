-- ========================================
-- 🔧 完整诊断：为什么别人看不到我填的字段
-- ========================================
-- 这个脚本会：
-- 1. 检查表结构是否完整
-- 2. 检查所有必需字段是否存在
-- 3. 显示当前实际数据
-- 4. 找出缺失的字段
-- ========================================

-- 步骤 1️⃣: 显示 badcases 表的完整结构
SELECT 
    '1️⃣ 当前表结构' AS check_name,
    column_name AS 字段名,
    data_type AS 数据类型,
    is_nullable AS 是否可空,
    column_default AS 默认值
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'badcases'
ORDER BY ordinal_position;

-- 步骤 2️⃣: 检查前端需要的所有字段是否存在
SELECT 
    '2️⃣ 必需字段检查' AS check_name,
    field_name AS 字段名,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'badcases' 
              AND column_name = field_name
        ) THEN '✅ 存在'
        ELSE '❌ 缺失'
    END AS 状态
FROM (VALUES 
    ('id'),
    ('date'),
    ('subject'),
    ('location'),
    ('full_tts_lesson_id'),
    ('cms_id'),
    ('reporter'),
    ('category'),
    ('expected_fix_date'),
    ('status'),
    ('description'),
    ('audio_url'),
    ('model_id'),
    ('created_at'),
    ('updated_at')
) AS required_fields(field_name);

-- 步骤 3️⃣: 显示最近创建的 5 条数据
SELECT 
    '3️⃣ 最近数据示例' AS info,
    id,
    date,
    subject,
    category,
    status,
    reporter,
    created_at
FROM public.badcases
ORDER BY created_at DESC
LIMIT 5;

-- 步骤 4️⃣: 统计各字段的空值情况
SELECT 
    '4️⃣ 字段填写统计' AS check_name,
    COUNT(*) AS 总记录数,
    COUNT(date) AS date_有值数,
    COUNT(subject) AS subject_有值数,
    COUNT(location) AS location_有值数,
    COUNT(reporter) AS reporter_有值数,
    COUNT(full_tts_lesson_id) AS full_tts_lesson_id_有值数,
    COUNT(cms_id) AS cms_id_有值数,
    COUNT(model_id) AS model_id_有值数,
    COUNT(audio_url) AS audio_url_有值数
FROM public.badcases;

-- 步骤 5️⃣: 找出所有空值的记录
SELECT 
    '5️⃣ 字段缺失的记录' AS info,
    id,
    CASE WHEN date IS NULL OR date = '' THEN '❌' ELSE '✅' END AS date,
    CASE WHEN subject IS NULL OR subject = '' THEN '❌' ELSE '✅' END AS subject,
    CASE WHEN reporter IS NULL OR reporter = '' THEN '❌' ELSE '✅' END AS reporter,
    CASE WHEN location IS NULL OR location = '' THEN '❌' ELSE '✅' END AS location,
    created_at
FROM public.badcases
WHERE 
    date IS NULL OR date = ''
    OR subject IS NULL OR subject = ''
    OR reporter IS NULL OR reporter = ''
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 📋 诊断总结
-- ========================================
SELECT 
    '📋 诊断总结' AS summary,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'badcases') AS 表字段总数,
    (SELECT COUNT(*) FROM public.badcases) AS 数据总数,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'badcases' 
              AND column_name = 'date'
        ) THEN '✅ date 字段存在'
        ELSE '❌ date 字段缺失（这是问题根源！）'
    END AS date_字段状态;


-- ========================================
-- 🔍 检查课节ID和模型ID的数据情况
-- ========================================

-- 1. 查看所有数据的课节ID和模型ID情况
SELECT 
    id AS "ID",
    subject AS "学科",
    location AS "出现位置",
    full_tts_lesson_id AS "全程TTS课节ID",
    cms_id AS "CMS课节ID",
    model_id AS "模型ID",
    reporter AS "提报人",
    CASE 
        WHEN location = 'fullTTS' AND (full_tts_lesson_id IS NULL OR full_tts_lesson_id = '') THEN '❌ 缺少全程TTS课节ID'
        WHEN location = 'interactive' AND (cms_id IS NULL OR cms_id = '') THEN '❌ 缺少CMS课节ID'
        WHEN location = 'interactive' AND (model_id IS NULL OR model_id = '') THEN '❌ 缺少模型ID'
        ELSE '✅ 完整'
    END AS "数据状态"
FROM public.badcases
ORDER BY created_at DESC;

-- 2. 统计数据完整性
SELECT 
    '📊 数据完整性统计' AS "统计类型",
    COUNT(*) AS "总记录数",
    SUM(CASE WHEN location = 'fullTTS' THEN 1 ELSE 0 END) AS "全程TTS记录数",
    SUM(CASE WHEN location = 'interactive' THEN 1 ELSE 0 END) AS "行课互动记录数",
    SUM(CASE WHEN location = 'fullTTS' AND (full_tts_lesson_id IS NOT NULL AND full_tts_lesson_id != '') THEN 1 ELSE 0 END) AS "有全程TTS课节ID",
    SUM(CASE WHEN location = 'interactive' AND (cms_id IS NOT NULL AND cms_id != '') THEN 1 ELSE 0 END) AS "有CMS课节ID",
    SUM(CASE WHEN location = 'interactive' AND (model_id IS NOT NULL AND model_id != '') THEN 1 ELSE 0 END) AS "有模型ID"
FROM public.badcases;

-- 3. 显示缺失数据的记录
SELECT 
    '❌ 缺失课节ID或模型ID的记录' AS "提示",
    id,
    subject,
    location,
    full_tts_lesson_id,
    cms_id,
    model_id,
    reporter
FROM public.badcases
WHERE 
    (location = 'fullTTS' AND (full_tts_lesson_id IS NULL OR full_tts_lesson_id = ''))
    OR (location = 'interactive' AND (cms_id IS NULL OR cms_id = ''))
    OR (location = 'interactive' AND (model_id IS NULL OR model_id = ''))
ORDER BY created_at DESC;


-- ========================================
-- 🛠️ 填充测试数据：课节ID和模型ID
-- ========================================
-- 这个脚本会为现有的 badcases 记录添加测试数据
-- 让表格能够显示课节ID和模型ID
-- ========================================

-- 提示：开始更新
DO $$ 
BEGIN 
    RAISE NOTICE '🚀 开始为现有记录填充课节ID和模型ID...';
END $$;

-- 步骤 1: 为数学学科的记录更新数据
UPDATE public.badcases
SET 
    location = 'interactive',
    cms_id = 'CMS_MATH_' || id,
    model_id = 'yuanshen_math'
WHERE subject = '数学' OR subject = 'mathematics'
RETURNING id, subject, location, cms_id, model_id;

-- 步骤 2: 为语文学科的记录更新数据
UPDATE public.badcases
SET 
    location = 'fullTTS',
    full_tts_lesson_id = 'FULLTTS_CN_' || id
WHERE subject = '语文' OR subject = 'chinese'
RETURNING id, subject, location, full_tts_lesson_id;

-- 步骤 3: 为英语学科的记录更新数据
UPDATE public.badcases
SET 
    location = 'interactive',
    cms_id = 'CMS_EN_' || id,
    model_id = 'yuanshen_english'
WHERE subject = '英语' OR subject = 'english'
RETURNING id, subject, location, cms_id, model_id;

-- 步骤 4: 为物理学科的记录更新数据
UPDATE public.badcases
SET 
    location = 'interactive',
    cms_id = 'CMS_PHY_' || id,
    model_id = 'yuanshen_physics'
WHERE subject = '物理' OR subject = 'physics'
RETURNING id, subject, location, cms_id, model_id;

-- 步骤 5: 为化学学科的记录更新数据
UPDATE public.badcases
SET 
    location = 'interactive',
    cms_id = 'CMS_CHEM_' || id,
    model_id = 'yuanshen_chemistry'
WHERE subject = '化学' OR subject = 'chemistry'
RETURNING id, subject, location, cms_id, model_id;

-- 步骤 6: 为没有学科的记录设置默认值
UPDATE public.badcases
SET 
    subject = '数学',
    location = 'interactive',
    cms_id = 'CMS_DEFAULT_' || id,
    model_id = 'yuanshen_math'
WHERE subject IS NULL OR subject = ''
RETURNING id, subject, location, cms_id, model_id;

-- 步骤 7: 验证更新结果
SELECT 
    '✅ 更新后的数据预览' AS "提示",
    id,
    subject AS "学科",
    location AS "位置",
    COALESCE(full_tts_lesson_id, '-') AS "全程TTS课节ID",
    COALESCE(cms_id, '-') AS "CMS课节ID",
    COALESCE(model_id, '-') AS "模型ID",
    reporter AS "提报人"
FROM public.badcases
ORDER BY created_at DESC
LIMIT 20;

-- 步骤 8: 统计更新结果
SELECT 
    '📊 更新统计' AS "类型",
    COUNT(*) AS "总记录数",
    SUM(CASE WHEN location = 'fullTTS' AND full_tts_lesson_id IS NOT NULL THEN 1 ELSE 0 END) AS "有全程TTS课节ID",
    SUM(CASE WHEN location = 'interactive' AND cms_id IS NOT NULL THEN 1 ELSE 0 END) AS "有CMS课节ID",
    SUM(CASE WHEN location = 'interactive' AND model_id IS NOT NULL THEN 1 ELSE 0 END) AS "有模型ID"
FROM public.badcases;

-- 完成提示
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎉 课节ID和模型ID已填充完成！';
    RAISE NOTICE '';
    RAISE NOTICE '📝 现在请：';
    RAISE NOTICE '  1. 刷新前端页面（Cmd+R）';
    RAISE NOTICE '  2. 查看表格的"课节ID"和"问题模型ID"列';
    RAISE NOTICE '  3. 应该能看到具体的ID数据了！';
    RAISE NOTICE '';
END $$;


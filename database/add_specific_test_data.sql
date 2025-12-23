-- ========================================
-- 🎯 添加具体的测试数据（可选）
-- ========================================
-- 如果你的数据库是空的，或者想要添加一些示例数据
-- 可以运行这个脚本
-- ========================================

-- 插入数学学科的测试数据（行课互动部分）
INSERT INTO public.badcases (
    id, date, subject, location, cms_id, reporter, 
    category, expected_fix_date, status, description, 
    model_id, created_at, updated_at
) VALUES 
(
    'BC0031',
    '2025-12-23',
    '数学',
    'interactive',
    'CMS_MATH_20251223_001',
    '张三',
    '读音错误',
    '2025-12-30',
    'pending',
    '在"勾股定理"一词的发音中，"勾"字的声调不准确，应为第一声gōu，但实际发音接近第三声gǒu',
    'yuanshen_math',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 插入语文学科的测试数据（全程TTS做课部分）
INSERT INTO public.badcases (
    id, date, subject, location, full_tts_lesson_id, reporter, 
    category, expected_fix_date, status, description, 
    created_at, updated_at
) VALUES 
(
    'BC0032',
    '2025-12-23',
    '语文',
    'fullTTS',
    'FULLTTS_CN_20251223_001',
    '李四',
    '停顿不当',
    '2025-12-28',
    'pending',
    '在朗读《静夜思》时，"床前明月光"一句中，"明"和"月"之间的停顿过长，不符合诗歌的韵律',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 插入英语学科的测试数据（行课互动部分）
INSERT INTO public.badcases (
    id, date, subject, location, cms_id, reporter, 
    category, expected_fix_date, status, description, 
    model_id, created_at, updated_at
) VALUES 
(
    'BC0033',
    '2025-12-23',
    '英语',
    'interactive',
    'CMS_EN_20251223_001',
    '王五',
    '重读不对',
    '2025-12-29',
    'processing',
    '在发音"beautiful"时，重音应该在第一音节"beau-"上，但实际重音在第二音节"-ti-"上',
    'yuanshen_english',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 插入物理学科的测试数据（行课互动部分）
INSERT INTO public.badcases (
    id, date, subject, location, cms_id, reporter, 
    category, expected_fix_date, status, description, 
    model_id, created_at, updated_at
) VALUES 
(
    'BC0034',
    '2025-12-23',
    '物理',
    'interactive',
    'CMS_PHY_20251223_001',
    '赵六',
    '语速突变',
    '2026-01-05',
    'pending',
    '在讲解"牛顿第一定律"时，前半句语速正常，但讲到"惯性"一词时语速突然加快，听起来不自然',
    'yuanshen_physics',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 验证插入结果
SELECT 
    '✅ 新增测试数据' AS "提示",
    id,
    subject AS "学科",
    location AS "位置",
    COALESCE(full_tts_lesson_id, cms_id) AS "课节ID",
    model_id AS "模型ID",
    reporter AS "提报人",
    category AS "分类"
FROM public.badcases
WHERE id IN ('BC0031', 'BC0032', 'BC0033', 'BC0034')
ORDER BY id;

-- 提示
DO $$ 
BEGIN 
    RAISE NOTICE '✅ 测试数据已添加！';
    RAISE NOTICE '现在前端应该能显示课节ID和模型ID了';
END $$;


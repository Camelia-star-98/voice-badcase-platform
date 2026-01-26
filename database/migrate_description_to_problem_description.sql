-- ================================================
-- 将原有的 description 字段内容迁移到 problem_description 字段
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 将 description 字段的内容复制到 problem_description 字段
-- 只更新 problem_description 为空的记录（避免覆盖已有数据）
UPDATE public.badcases
SET problem_description = description
WHERE (problem_description IS NULL OR problem_description = '')
  AND description IS NOT NULL
  AND description != '';

-- 显示迁移结果统计
DO $$ 
DECLARE
  migrated_count INTEGER;
  total_count INTEGER;
BEGIN 
  -- 统计迁移的记录数
  SELECT COUNT(*) INTO migrated_count
  FROM public.badcases
  WHERE problem_description IS NOT NULL
    AND problem_description != '';
  
  -- 统计总记录数
  SELECT COUNT(*) INTO total_count
  FROM public.badcases;
  
  RAISE NOTICE '✅ 数据迁移完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📊 迁移统计：';
  RAISE NOTICE '  - 总记录数：%', total_count;
  RAISE NOTICE '  - 已迁移记录数：%', migrated_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ 原有的 description 内容已复制到 problem_description 字段';
END $$;

-- 验证迁移结果（显示前10条记录）
SELECT 
  id,
  description,
  problem_description,
  CASE 
    WHEN problem_description IS NOT NULL AND problem_description != '' THEN '✅ 已迁移'
    ELSE '❌ 未迁移'
  END AS migration_status
FROM public.badcases
ORDER BY created_at DESC
LIMIT 10;

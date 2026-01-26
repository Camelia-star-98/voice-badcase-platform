-- ================================================
-- 恢复 description 字段：将 problem_description 和 problem_text 合并回 description
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 恢复策略：
-- 1. 如果 description 为空但 problem_description 有值，使用 problem_description
-- 2. 如果 problem_description 和 problem_text 都有值，合并它们
-- 3. 如果只有 problem_description，使用它
-- 4. 如果只有 problem_text，使用它

UPDATE public.badcases
SET description = CASE
  -- 情况1：description为空，但problem_description和problem_text都有值
  WHEN (description IS NULL OR description = '') 
       AND problem_description IS NOT NULL 
       AND problem_description != ''
       AND problem_text IS NOT NULL 
       AND problem_text != ''
  THEN problem_description || E'\n\n问题文本：' || problem_text
  
  -- 情况2：description为空，只有problem_description
  WHEN (description IS NULL OR description = '') 
       AND problem_description IS NOT NULL 
       AND problem_description != ''
  THEN problem_description
  
  -- 情况3：description为空，只有problem_text
  WHEN (description IS NULL OR description = '') 
       AND problem_text IS NOT NULL 
       AND problem_text != ''
  THEN problem_text
  
  -- 情况4：description已有值，保持不变
  ELSE description
END
WHERE (description IS NULL OR description = '')
  AND (
    (problem_description IS NOT NULL AND problem_description != '')
    OR (problem_text IS NOT NULL AND problem_text != '')
  );

-- 显示恢复结果统计
DO $$ 
DECLARE
  restored_count INTEGER;
  total_count INTEGER;
  has_description_count INTEGER;
BEGIN 
  -- 统计恢复的记录数
  SELECT COUNT(*) INTO restored_count
  FROM public.badcases
  WHERE description IS NOT NULL
    AND description != '';
  
  -- 统计总记录数
  SELECT COUNT(*) INTO total_count
  FROM public.badcases;
  
  -- 统计有description的记录数
  SELECT COUNT(*) INTO has_description_count
  FROM public.badcases
  WHERE description IS NOT NULL
    AND description != ''
    AND (
      (problem_description IS NOT NULL AND problem_description != '')
      OR (problem_text IS NOT NULL AND problem_text != '')
    );
  
  RAISE NOTICE '✅ 数据恢复完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📊 恢复统计：';
  RAISE NOTICE '  - 总记录数：%', total_count;
  RAISE NOTICE '  - 有description的记录数：%', restored_count;
  RAISE NOTICE '  - 从problem_description/problem_text恢复的记录数：%', has_description_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ description 字段已恢复，原有数据已找回';
END $$;

-- 验证恢复结果（显示前10条记录）
SELECT 
  id,
  description,
  problem_description,
  problem_text,
  CASE 
    WHEN description IS NOT NULL AND description != '' THEN '✅ 已恢复'
    ELSE '❌ 无数据'
  END AS restore_status
FROM public.badcases
ORDER BY created_at DESC
LIMIT 10;

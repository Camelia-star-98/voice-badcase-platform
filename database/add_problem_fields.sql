-- ================================================
-- 为Next方向添加问题描述和问题文本字段
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 为 badcases 表添加新字段（Next方向使用）
ALTER TABLE public.badcases 
ADD COLUMN IF NOT EXISTS problem_description TEXT,
ADD COLUMN IF NOT EXISTS problem_text TEXT;

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_badcases_problem_description ON public.badcases(problem_description);
CREATE INDEX IF NOT EXISTS idx_badcases_problem_text ON public.badcases(problem_text);

-- 验证字段添加成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ 字段添加完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📋 新增字段：';
  RAISE NOTICE '  - problem_description (问题描述：出现的问题，以及期望的结果)';
  RAISE NOTICE '  - problem_text (问题文本：出现问题的原始文本)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 已创建索引以提升查询性能';
END $$;

-- 显示当前表结构
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'badcases'
  AND column_name IN ('description', 'problem_description', 'problem_text')
ORDER BY ordinal_position;

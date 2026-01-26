-- ================================================
-- 添加大小模型字段
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 添加 model_size 字段（大小模型：large_model 或 small_model）
ALTER TABLE public.badcases
ADD COLUMN IF NOT EXISTS model_size TEXT;

-- 添加注释
COMMENT ON COLUMN public.badcases.model_size IS '大小模型：large_model（大模型）或 small_model（小模型）';

-- 验证字段添加成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ 已添加 model_size 字段';
  RAISE NOTICE '';
  RAISE NOTICE '📋 字段说明：';
  RAISE NOTICE '  - model_size: 大小模型类型';
  RAISE NOTICE '    * large_model: 大模型';
  RAISE NOTICE '    * small_model: 小模型';
END $$;

-- 显示更新后的表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'badcases'
  AND column_name = 'model_size';

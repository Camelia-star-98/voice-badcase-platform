-- ================================================
-- 为Next方向添加备注字段
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 为 badcases 表添加备注字段（如果不存在）
ALTER TABLE public.badcases 
ADD COLUMN IF NOT EXISTS remark TEXT;

-- 创建索引以提升查询性能（可选）
CREATE INDEX IF NOT EXISTS idx_badcases_remark ON public.badcases(remark);

-- 验证字段添加成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ 备注字段添加完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📋 新增字段：';
  RAISE NOTICE '  - remark (备注：可在此处备注复现反馈、跟进状态、流转状态、当前效果说明等)';
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
  AND column_name = 'remark';

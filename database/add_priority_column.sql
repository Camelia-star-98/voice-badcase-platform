-- ================================================
-- 添加修复优先级字段到 badcases 表
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 添加 priority 字段（修复优先级）
-- 可选值：P00（立刻修复）、P0（多天内修复）、P1（多周内修复）、P2（可先不修）
ALTER TABLE public.badcases 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'P1';

-- 添加注释说明
COMMENT ON COLUMN public.badcases.priority IS '修复优先级：P00（立刻修复）、P0（多天内修复）、P1（多周内修复）、P2（可先不修）';

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_badcases_priority ON public.badcases(priority);

-- 验证字段添加成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Priority 字段添加成功！';
  RAISE NOTICE '';
  RAISE NOTICE '📋 字段信息：';
  RAISE NOTICE '  - priority (修复优先级)';
  RAISE NOTICE '  - 默认值: P1（多周内修复）';
  RAISE NOTICE '  - 可选值: P00（立刻修复）、P0（多天内修复）、P1（多周内修复）、P2（可先不修）';
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
  AND column_name = 'priority';






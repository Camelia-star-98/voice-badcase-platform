-- ================================================
-- 检查并修复 badcases 表结构
-- ================================================
-- 在 Supabase SQL Editor 中执行此脚本
-- ================================================

-- 1️⃣ 检查当前表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'badcases' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2️⃣ 检查 category 列是否存在
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'badcases' 
              AND column_name = 'category'
        ) THEN '✅ category 列存在'
        ELSE '❌ category 列不存在 - 需要添加'
    END AS category_status;

-- 3️⃣ 如果 category 不存在，添加它
DO $$
BEGIN
    -- 检查 category 列是否存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'badcases' 
          AND column_name = 'category'
    ) THEN
        -- 添加 category 列
        ALTER TABLE public.badcases 
        ADD COLUMN category TEXT NOT NULL DEFAULT '未分类';
        
        RAISE NOTICE '✅ 已添加 category 列';
    ELSE
        RAISE NOTICE '✅ category 列已存在，无需添加';
    END IF;
END $$;

-- 4️⃣ 创建或更新 category 索引
DROP INDEX IF EXISTS idx_badcases_category;
CREATE INDEX idx_badcases_category ON public.badcases(category);

-- 5️⃣ 验证表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'badcases' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6️⃣ 显示当前数据统计
SELECT 
    '📊 总记录数: ' || COUNT(*) AS statistics
FROM public.badcases;

-- 7️⃣ 刷新 Supabase schema cache
NOTIFY pgrst, 'reload schema';

SELECT '✅ 表结构检查和修复完成！' AS message;


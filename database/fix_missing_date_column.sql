-- ================================================
-- 修复 badcases 表的 date 字段问题
-- ================================================
-- 问题：前端报错 "Could not find the 'date' column of 'badcases' in the schema cache"
-- 原因：表结构可能损坏或不同步
-- 解决方案：检查并重建表结构
-- ================================================

-- 步骤 1：检查当前表结构
DO $$ 
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'badcases' 
        AND column_name = 'date'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE '✅ date 列存在';
    ELSE
        RAISE NOTICE '❌ date 列不存在 - 需要添加';
    END IF;
END $$;

-- 步骤 2：如果 date 列不存在，添加它
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'badcases' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN date TEXT NOT NULL DEFAULT '';
        RAISE NOTICE '✅ 已添加 date 列';
    END IF;
END $$;

-- 步骤 3：刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 步骤 4：显示当前表结构
SELECT 
    '当前 badcases 表结构' as report_title,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'badcases'
ORDER BY ordinal_position;

-- 步骤 5：验证 Realtime 配置
SELECT 
    '✅ Realtime 配置状态' as report_title,
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'badcases';

-- 步骤 6：最终提示
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎉 修复完成！';
    RAISE NOTICE '';
    RAISE NOTICE '📝 请执行以下操作：';
    RAISE NOTICE '  1. 在前端强制刷新（Cmd+Shift+R）';
    RAISE NOTICE '  2. 清除浏览器缓存';
    RAISE NOTICE '  3. 如果问题仍存在，重启 Supabase PostgREST：';
    RAISE NOTICE '     - 访问 Supabase Dashboard';
    RAISE NOTICE '     - Project Settings > API > Restart API';
    RAISE NOTICE '';
END $$;


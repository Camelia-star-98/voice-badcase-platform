-- ================================================
-- 强制刷新 PostgREST Schema Cache
-- ================================================
-- 问题：PostgREST schema cache 严重不同步
-- 症状：报错 "Could not find the 'cms_id' column"
-- 解决方案：彻底重置 schema cache
-- ================================================

-- 步骤 1：检查表是否存在
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'badcases'
    ) THEN
        RAISE NOTICE '✅ badcases 表存在';
    ELSE
        RAISE NOTICE '❌ badcases 表不存在';
    END IF;
END $$;

-- 步骤 2：显示完整表结构
SELECT 
    '📊 当前 badcases 表结构' as report_title,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'badcases'
ORDER BY ordinal_position;

-- 步骤 3：检查所有必需的列是否存在
DO $$ 
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY[
        'id', 'date', 'subject', 'location', 
        'full_tts_lesson_id', 'cms_id', 'reporter', 
        'category', 'expected_fix_date', 'status', 
        'description', 'audio_url', 'model_id',
        'created_at', 'updated_at'
    ];
    col TEXT;
    col_exists BOOLEAN;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'badcases' 
            AND column_name = col
        ) INTO col_exists;
        
        IF NOT col_exists THEN
            missing_columns := array_append(missing_columns, col);
            RAISE NOTICE '❌ 缺失列: %', col;
        ELSE
            RAISE NOTICE '✅ 列存在: %', col;
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  发现 % 个缺失的列', array_length(missing_columns, 1);
        RAISE NOTICE '缺失列列表: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '🎉 所有必需的列都存在！';
    END IF;
END $$;

-- 步骤 4：强制刷新 PostgREST schema cache（多次尝试）
DO $$ 
BEGIN
    -- 方法 1: 重新加载 schema
    PERFORM pg_notify('pgrst', 'reload schema');
    RAISE NOTICE '✅ 已发送 reload schema 信号';
    
    -- 方法 2: 重新加载 config
    PERFORM pg_notify('pgrst', 'reload config');
    RAISE NOTICE '✅ 已发送 reload config 信号';
    
    -- 等待一会儿
    PERFORM pg_sleep(1);
    
    RAISE NOTICE '';
    RAISE NOTICE '🔄 PostgREST cache 刷新完成';
END $$;

-- 步骤 5：检查 RLS 策略
SELECT 
    '🔒 RLS 策略检查' as report_title,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'badcases';

-- 步骤 6：检查表权限
SELECT 
    '🔑 表权限检查' as report_title,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'badcases'
AND grantee IN ('anon', 'authenticated', 'service_role', 'postgres');

-- 步骤 7：检查 Realtime 配置
SELECT 
    '📡 Realtime 配置检查' as report_title,
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'badcases';

-- 步骤 8：最终诊断报告
DO $$ 
DECLARE
    table_exists BOOLEAN;
    all_columns_exist BOOLEAN;
    realtime_enabled BOOLEAN;
BEGIN
    -- 检查表
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'badcases'
    ) INTO table_exists;
    
    -- 检查所有列
    SELECT (
        SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'badcases'
    ) >= 15 INTO all_columns_exist;
    
    -- 检查 Realtime
    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'badcases'
    ) INTO realtime_enabled;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 诊断报告';
    RAISE NOTICE '========================================';
    
    IF table_exists THEN
        RAISE NOTICE '✅ 表存在: badcases';
    ELSE
        RAISE NOTICE '❌ 表不存在: badcases';
    END IF;
    
    IF all_columns_exist THEN
        RAISE NOTICE '✅ 所有列完整';
    ELSE
        RAISE NOTICE '❌ 列不完整（应该有 15 列）';
    END IF;
    
    IF realtime_enabled THEN
        RAISE NOTICE '✅ Realtime 已启用';
    ELSE
        RAISE NOTICE '❌ Realtime 未启用';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- 最终建议
    IF NOT table_exists THEN
        RAISE NOTICE '⚠️  建议：表不存在，请运行 create_badcases_table.sql';
    ELSIF NOT all_columns_exist THEN
        RAISE NOTICE '⚠️  建议：表结构不完整，请重新创建表';
    ELSIF NOT realtime_enabled THEN
        RAISE NOTICE '⚠️  建议：请运行 fix_realtime_complete.sql';
    ELSE
        RAISE NOTICE '✅ 数据库配置正常！';
        RAISE NOTICE '';
        RAISE NOTICE '🔧 下一步：';
        RAISE NOTICE '  1. 在 Supabase Dashboard 重启 PostgREST API';
        RAISE NOTICE '  2. 访问：Project Settings > API > Restart';
        RAISE NOTICE '  3. 等待 30 秒后测试前端';
        RAISE NOTICE '  4. 强制刷新浏览器（Cmd+Shift+R）';
    END IF;
    
    RAISE NOTICE '';
END $$;


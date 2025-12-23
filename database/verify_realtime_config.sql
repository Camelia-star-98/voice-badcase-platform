-- ========================================
-- 🔍 验证 Realtime 配置完整性
-- ========================================

-- 1️⃣ 检查表是否在 Realtime publication 中
SELECT 
    '1️⃣ Realtime Publication 状态' AS check_name,
    CASE 
        WHEN EXISTS(
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'badcases'
        ) THEN '✅ 已启用'
        ELSE '❌ 未启用'
    END AS status;

-- 2️⃣ 检查 REPLICA IDENTITY 设置
SELECT 
    '2️⃣ REPLICA IDENTITY 状态' AS check_name,
    CASE c.relreplident
        WHEN 'd' THEN '⚠️ DEFAULT (建议改为 FULL)'
        WHEN 'n' THEN '❌ NOTHING (需要改为 FULL)'
        WHEN 'f' THEN '✅ FULL (正确)'
        WHEN 'i' THEN '⚠️ INDEX (建议改为 FULL)'
        ELSE '❓ 未知状态'
    END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname = 'badcases';

-- 3️⃣ 检查表权限
SELECT 
    '3️⃣ 表权限状态' AS check_name,
    string_agg(grantee || ': ' || privilege_type, ', ') AS status
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
  AND table_name = 'badcases'
  AND grantee IN ('anon', 'authenticated', 'postgres')
GROUP BY table_name;

-- 4️⃣ 列出所有在 Realtime 中的表
SELECT 
    '4️⃣ Realtime 启用的所有表' AS info,
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- ========================================
-- 📋 配置总结
-- ========================================
SELECT 
    '📋 配置总结' AS summary,
    CASE 
        WHEN EXISTS(
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND tablename = 'badcases'
        ) AND EXISTS(
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
              AND c.relname = 'badcases'
              AND c.relreplident = 'f'
        ) THEN '✅ Realtime 配置完整，可以正常使用'
        ELSE '⚠️ 配置不完整，需要修复'
    END AS result;


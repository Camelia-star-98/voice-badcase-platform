-- ========================================
-- 🔧 修复 REPLICA IDENTITY 设置
-- ========================================
-- 如果表已经在 publication 中但 REPLICA IDENTITY 不是 FULL
-- 运行此脚本来修复
-- ========================================

-- 设置 REPLICA IDENTITY 为 FULL
-- 这样 Realtime 可以监听到完整的行变化
ALTER TABLE public.badcases REPLICA IDENTITY FULL;

-- 验证设置
SELECT 
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN '❌ DEFAULT'
        WHEN 'n' THEN '❌ NOTHING'
        WHEN 'f' THEN '✅ FULL'
        WHEN 'i' THEN '⚠️ INDEX'
    END AS replica_identity,
    CASE c.relreplident
        WHEN 'f' THEN '✅ 配置正确！'
        ELSE '❌ 需要设置为 FULL'
    END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname = 'badcases';

-- ========================================
-- ✅ 完成！
-- ========================================
SELECT '✅ REPLICA IDENTITY 已设置为 FULL' AS result;


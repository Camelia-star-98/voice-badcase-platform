-- ========================================
-- 🚀 Supabase Realtime 完整启用脚本
-- ========================================
-- 此脚本会：
-- 1. 启用 Realtime 复制
-- 2. 配置表的 Realtime 功能
-- 3. 验证配置是否成功
-- ========================================

-- 步骤 1: 启用表的 Realtime 复制
-- ========================================
-- 这会让 Supabase 开始监听表的所有变化（INSERT, UPDATE, DELETE）

-- 为 badcases 表启用 Realtime
ALTER TABLE public.badcases REPLICA IDENTITY FULL;

-- 发布表的变化（启用 Realtime）
-- 注意：supabase_realtime 是 Supabase 的默认 publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.badcases;

-- 步骤 2: 验证 Realtime 是否已启用
-- ========================================

-- 查看当前 publication 包含的表
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 查看表的 REPLICA IDENTITY 设置
SELECT 
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'DEFAULT'
        WHEN 'n' THEN 'NOTHING'
        WHEN 'f' THEN 'FULL'
        WHEN 'i' THEN 'INDEX'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname = 'badcases';

-- 步骤 3: 检查 Realtime 配置状态
-- ========================================
SELECT 
    'badcases' AS table_name,
    EXISTS(
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'badcases'
    ) AS realtime_enabled;

-- 步骤 4: 如果需要禁用 Realtime（用于调试）
-- ========================================
-- 取消注释以下行来禁用 Realtime
-- ALTER PUBLICATION supabase_realtime DROP TABLE public.badcases;

-- ========================================
-- ✅ 完成！
-- ========================================
-- 运行此脚本后，您的 badcases 表应该已经启用了 Realtime。
-- 
-- 接下来：
-- 1. 刷新浏览器页面
-- 2. 打开浏览器控制台
-- 3. 查看是否有 "✅ Realtime 订阅成功" 的消息
-- ========================================


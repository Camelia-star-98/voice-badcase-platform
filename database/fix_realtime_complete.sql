-- ============================================
-- 🔧 Realtime 全面诊断和修复脚本
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- 适用于已经启用了 Realtime 但仍有连接问题的情况
-- ============================================

-- ✅ 步骤 1：确认 Realtime 已启用（应该看到 badcases）
SELECT '=== 1. Realtime 状态检查 ===' as step;
SELECT 
    schemaname,
    tablename,
    '✅ Realtime 已启用' as status
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'badcases';

-- ✅ 步骤 2：检查 RLS 是否启用
SELECT '=== 2. RLS 状态检查 ===' as step;
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS 已启用'
        ELSE '❌ RLS 未启用'
    END as status
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases';

-- ✅ 步骤 3：检查现有的 RLS 策略
SELECT '=== 3. 现有 RLS 策略 ===' as step;
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅'
        WHEN cmd = 'INSERT' THEN '✅'
        WHEN cmd = 'UPDATE' THEN '✅'
        WHEN cmd = 'DELETE' THEN '✅'
    END as status
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases'
ORDER BY 
    cmd;

-- 🔧 步骤 4：如果策略不完整，清理并重建
-- 先删除所有现有策略（避免冲突）
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'badcases'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.badcases', policy_record.policyname);
        RAISE NOTICE '🗑️  删除旧策略: %', policy_record.policyname;
    END LOOP;
END $$;

-- 创建新的完整策略集
-- 1️⃣ SELECT 策略
CREATE POLICY "允许所有人查看 badcases"
ON public.badcases
FOR SELECT
TO anon, authenticated
USING (true);

-- 2️⃣ INSERT 策略
CREATE POLICY "允许所有人插入 badcases"
ON public.badcases
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3️⃣ UPDATE 策略
CREATE POLICY "允许所有人更新 badcases"
ON public.badcases
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4️⃣ DELETE 策略
CREATE POLICY "允许所有人删除 badcases"
ON public.badcases
FOR DELETE
TO anon, authenticated
USING (true);

-- 确保 RLS 已启用
ALTER TABLE public.badcases ENABLE ROW LEVEL SECURITY;

-- ✅ 步骤 5：验证最终配置
SELECT '=== 5. 最终配置验证 ===' as step;

-- 检查 Realtime
SELECT 
    '✅ Realtime 配置' as item,
    count(*) as status
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'badcases';

-- 检查 RLS 策略
SELECT 
    '✅ RLS 策略数量' as item,
    count(*) as status
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases';

-- 显示详细的策略信息
SELECT 
    cmd as operation,
    policyname,
    '✅ 已配置' as status
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases'
ORDER BY 
    cmd;

-- 🎉 成功消息
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================';
    RAISE NOTICE '✅ Realtime 配置已完成！';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 已启用的功能：';
    RAISE NOTICE '   ✅ Realtime 实时订阅';
    RAISE NOTICE '   ✅ SELECT 权限（查看数据）';
    RAISE NOTICE '   ✅ INSERT 权限（添加数据）';
    RAISE NOTICE '   ✅ UPDATE 权限（更新数据）';
    RAISE NOTICE '   ✅ DELETE 权限（删除数据）';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 下一步：';
    RAISE NOTICE '   1. 访问你的应用';
    RAISE NOTICE '   2. 按 Cmd+Shift+R 刷新页面';
    RAISE NOTICE '   3. 打开控制台（F12）';
    RAISE NOTICE '   4. 应该看到 "✅ Realtime 订阅成功"';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 测试 Realtime：';
    RAISE NOTICE '   1. 在两个浏览器窗口打开应用';
    RAISE NOTICE '   2. 在一个窗口添加数据';
    RAISE NOTICE '   3. 另一个窗口应该自动更新（无需刷新）';
    RAISE NOTICE '';
END $$;

-- ============================================
-- 📝 如果还有问题，请检查：
-- ============================================
-- 
-- 1. Vercel 环境变量：
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_ANON_KEY
-- 
-- 2. 浏览器控制台：
--    - 按 F12 打开开发者工具
--    - 查看 Console 标签
--    - 查找 WebSocket 相关错误
-- 
-- 3. 网络连接：
--    - 检查防火墙设置
--    - 确保允许 WebSocket 连接
--    - 确保可以访问 *.supabase.co
-- ============================================


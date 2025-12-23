-- ============================================
-- 🔍 检查 Realtime 配置状态
-- ============================================
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1️⃣ 检查 Realtime 是否已启用
SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'badcases';

-- ✅ 如果有结果，说明 Realtime 已启用

-- 2️⃣ 检查 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases'
ORDER BY 
    cmd, policyname;

-- 3️⃣ 检查表是否启用了 RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename = 'badcases';

-- ============================================
-- 📋 预期结果
-- ============================================
-- 
-- 查询 1：应该看到 badcases 表
-- 查询 2：应该看到 4 个策略（SELECT, INSERT, UPDATE, DELETE）
-- 查询 3：rowsecurity 应该是 true
-- ============================================


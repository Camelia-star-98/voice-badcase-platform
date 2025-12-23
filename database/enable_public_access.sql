-- ============================================
-- 启用 Supabase 公开访问权限
-- ============================================
-- 此脚本允许任何人（包括未登录用户）向 badcases 表插入、读取和更新数据
-- 
-- 使用方法：
-- 1. 登录到 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ============================================

-- 1. 允许匿名用户读取所有数据
CREATE POLICY "允许所有人查看 badcases"
ON public.badcases
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. 允许匿名用户插入数据
CREATE POLICY "允许所有人插入 badcases"
ON public.badcases
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. 允许匿名用户更新数据
CREATE POLICY "允许所有人更新 badcases"
ON public.badcases
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. 允许匿名用户删除数据
CREATE POLICY "允许所有人删除 badcases"
ON public.badcases
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. 确保 RLS 已启用
ALTER TABLE public.badcases ENABLE ROW LEVEL SECURITY;

-- 验证权限设置
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'badcases';

-- 显示成功消息
DO $$ 
BEGIN 
  RAISE NOTICE '✅ 公开访问权限已启用！';
  RAISE NOTICE '📝 任何人现在都可以：';
  RAISE NOTICE '   - 查看所有 badcases 数据';
  RAISE NOTICE '   - 添加新的 badcase 记录';
  RAISE NOTICE '   - 更新现有记录';
  RAISE NOTICE '   - 删除记录';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  注意：这适合演示和开发环境';
  RAISE NOTICE '   生产环境建议添加适当的访问控制';
END $$;


-- =====================================================
-- 修复重复的 Badcase ID 问题
-- =====================================================
-- 作用：检查并修复 badcases 表中的重复ID
-- 日期：2025-12-23
-- 使用方法：在 Supabase SQL Editor 中逐段执行
-- =====================================================

-- ========== 第一步：诊断问题 ==========

-- 1. 查看是否有重复的 ID
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT id
    FROM badcases
    GROUP BY id
    HAVING COUNT(*) > 1
  ) AS duplicates;
  
  RAISE NOTICE '发现 % 个重复的ID', duplicate_count;
END $$;

-- 2. 查看所有重复记录的详细信息
SELECT 
  id, 
  created_at, 
  date, 
  subject, 
  reporter,
  status
FROM badcases
WHERE id IN (
  SELECT id
  FROM badcases
  GROUP BY id
  HAVING COUNT(*) > 1
)
ORDER BY id, created_at;

-- ========== 第二步：修复问题 ==========

-- 3. 删除重复记录，只保留最早创建的那条
-- 使用 ctid (PostgreSQL 的内部行标识符) 来删除重复项
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 删除重复记录
  WITH duplicates AS (
    SELECT ctid, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at ASC) as rn
    FROM badcases
  )
  DELETE FROM badcases
  WHERE ctid IN (
    SELECT ctid FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE '成功删除 % 条重复记录', deleted_count;
END $$;

-- ========== 第三步：验证结果 ==========

-- 4. 验证是否还有重复
SELECT id, COUNT(*) as count
FROM badcases
GROUP BY id
HAVING COUNT(*) > 1;

-- 5. 查看当前所有记录数量
SELECT COUNT(*) as total_records FROM badcases;

-- 6. 查看最近的 10 条记录
SELECT id, date, subject, reporter, status, created_at
FROM badcases
ORDER BY created_at DESC
LIMIT 10;

-- ========== 第四步：确保数据完整性 ==========

-- 7. 确认主键约束存在
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'badcases'::regclass
  AND contype = 'p';

-- 8. 如果没有主键，添加主键约束（谨慎执行）
-- ALTER TABLE badcases ADD PRIMARY KEY (id);

-- ========== 完成 ==========
-- 执行完成后，重新测试前端添加功能
-- 应该不再出现 duplicate key 错误


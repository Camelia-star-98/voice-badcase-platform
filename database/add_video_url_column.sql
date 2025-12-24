-- ================================================
-- 添加视频URL字段到 badcases 表
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 添加 video_url 字段
ALTER TABLE public.badcases 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 添加注释说明
COMMENT ON COLUMN public.badcases.video_url IS '视频文件URL，用于更直观地定位和分类问题';

-- 验证字段添加成功
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'badcases' 
    AND column_name = 'video_url'
  ) THEN
    RAISE NOTICE '✅ video_url 字段添加成功！';
    RAISE NOTICE '';
    RAISE NOTICE '📋 字段信息：';
    RAISE NOTICE '  - 字段名：video_url';
    RAISE NOTICE '  - 类型：TEXT';
    RAISE NOTICE '  - 可空：是';
    RAISE NOTICE '  - 说明：视频文件URL，用于更直观地定位和分类问题';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 配置完成！现在可以上传视频文件了';
  ELSE
    RAISE EXCEPTION '❌ video_url 字段添加失败';
  END IF;
END $$;

-- 显示当前表结构
SELECT 
  column_name as "字段名",
  data_type as "数据类型",
  is_nullable as "可空",
  column_default as "默认值"
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'badcases'
ORDER BY ordinal_position;


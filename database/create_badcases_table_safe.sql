-- ================================================
-- 语音 Badcase 平台 - 安全创建 badcases 表（避免重复错误）
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 创建 badcases 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.badcases (
    -- 主键
    id TEXT PRIMARY KEY,
    
    -- 基本信息
    date TEXT NOT NULL,                          -- 提交日期
    description TEXT NOT NULL,                   -- 问题描述
    
    -- 分类和状态
    subject TEXT,                                -- 学科（语文、数学、英语等）
    category TEXT NOT NULL,                      -- 问题类别
    status TEXT NOT NULL DEFAULT 'pending',      -- 状态：pending, processing, resolved
    priority TEXT DEFAULT 'medium',              -- 修复优先级：high, medium, low
    
    -- 位置信息
    location TEXT,                               -- 出现位置：fullTTS 或 interactive
    full_tts_lesson_id TEXT,                     -- 全程TTS课节ID
    cms_id TEXT,                                 -- CMS课程ID或课节ID
    
    -- 人员和时间
    reporter TEXT,                               -- 问题提报人
    expected_fix_date TEXT,                       -- 期望修复时间
    
    -- 附加信息
    audio_url TEXT,                              -- 音频URL
    video_url TEXT,                              -- 视频URL
    model_id TEXT,                               -- 问题模型ID
    
    -- 时间戳（自动管理）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提升查询性能（如果不存在）
CREATE INDEX IF NOT EXISTS idx_badcases_date ON public.badcases(date);
CREATE INDEX IF NOT EXISTS idx_badcases_status ON public.badcases(status);
CREATE INDEX IF NOT EXISTS idx_badcases_category ON public.badcases(category);
CREATE INDEX IF NOT EXISTS idx_badcases_subject ON public.badcases(subject);
CREATE INDEX IF NOT EXISTS idx_badcases_priority ON public.badcases(priority);
CREATE INDEX IF NOT EXISTS idx_badcases_created_at ON public.badcases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badcases_reporter ON public.badcases(reporter);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_badcases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_badcases_updated_at ON public.badcases;
CREATE TRIGGER trigger_update_badcases_updated_at
    BEFORE UPDATE ON public.badcases
    FOR EACH ROW
    EXECUTE FUNCTION update_badcases_updated_at();

-- 启用行级安全策略 (RLS)
ALTER TABLE public.badcases ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在），然后重新创建
DROP POLICY IF EXISTS "允许所有人查看 badcases" ON public.badcases;
DROP POLICY IF EXISTS "允许所有人插入 badcases" ON public.badcases;
DROP POLICY IF EXISTS "允许所有人更新 badcases" ON public.badcases;
DROP POLICY IF EXISTS "允许所有人删除 badcases" ON public.badcases;

-- 创建公开访问策略（允许所有人进行所有操作）
-- 允许所有人查看
CREATE POLICY "允许所有人查看 badcases"
ON public.badcases
FOR SELECT
TO anon, authenticated
USING (true);

-- 允许所有人插入
CREATE POLICY "允许所有人插入 badcases"
ON public.badcases
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 允许所有人更新
CREATE POLICY "允许所有人更新 badcases"
ON public.badcases
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 允许所有人删除
CREATE POLICY "允许所有人删除 badcases"
ON public.badcases
FOR DELETE
TO anon, authenticated
USING (true);

-- 启用 Realtime（实时数据同步）
-- 注意：如果表已经在 Realtime 中，这个操作会被忽略
DO $$
BEGIN
    -- 尝试添加到 Realtime，如果失败则忽略
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.badcases;
    EXCEPTION
        WHEN duplicate_object THEN
            -- 表已经在 Realtime 中，忽略错误
            RAISE NOTICE '表已经在 Realtime 中';
    END;
END $$;

-- 验证表创建成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Badcases 表配置完成！';
  RAISE NOTICE '';
  RAISE NOTICE '📋 表结构：';
  RAISE NOTICE '  - id (主键)';
  RAISE NOTICE '  - date (提交日期)';
  RAISE NOTICE '  - subject (学科)';
  RAISE NOTICE '  - location (位置)';
  RAISE NOTICE '  - priority (修复优先级) ⭐';
  RAISE NOTICE '  - category (问题类别)';
  RAISE NOTICE '  - status (状态)';
  RAISE NOTICE '  - description (描述)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 已创建索引以提升查询性能';
  RAISE NOTICE '✅ 已启用行级安全策略 (RLS)';
  RAISE NOTICE '✅ 已设置公开访问权限';
  RAISE NOTICE '✅ 已启用 Realtime 实时同步';
END $$;

-- 显示当前表结构
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'badcases'
ORDER BY ordinal_position;


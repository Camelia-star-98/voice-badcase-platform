-- ================================================
-- 语音 Badcase 平台 - 创建 badcases 表
-- ================================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ================================================

-- 删除旧表（如果存在）- 注意：这会删除所有数据！
-- DROP TABLE IF EXISTS public.badcases CASCADE;

-- 创建 badcases 表
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
    
    -- 位置信息
    location TEXT,                               -- 出现位置：fullTTS 或 interactive
    full_tts_lesson_id TEXT,                     -- 全程TTS课节ID
    cms_id TEXT,                                 -- CMS课程ID或课节ID
    
    -- 人员和时间
    reporter TEXT,                               -- 问题提报人
    expected_fix_date TEXT,                      -- 期望修复时间
    
    -- 附加信息
    audio_url TEXT,                              -- 音频URL
    model_id TEXT,                               -- 问题模型ID
    
    -- 时间戳（自动管理）
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_badcases_date ON public.badcases(date);
CREATE INDEX IF NOT EXISTS idx_badcases_status ON public.badcases(status);
CREATE INDEX IF NOT EXISTS idx_badcases_category ON public.badcases(category);
CREATE INDEX IF NOT EXISTS idx_badcases_subject ON public.badcases(subject);
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

-- 创建公开访问策略（允许所有人进行所有操作）
-- 注意：这适合演示和开发环境，生产环境请根据需要调整

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
ALTER PUBLICATION supabase_realtime ADD TABLE public.badcases;

-- 验证表创建成功
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Badcases 表创建成功！';
  RAISE NOTICE '';
  RAISE NOTICE '📋 表结构：';
  RAISE NOTICE '  - id (主键)';
  RAISE NOTICE '  - date (提交日期)';
  RAISE NOTICE '  - subject (学科)';
  RAISE NOTICE '  - location (位置)';
  RAISE NOTICE '  - full_tts_lesson_id (全程TTS课节ID)';
  RAISE NOTICE '  - cms_id (CMS课程ID)';
  RAISE NOTICE '  - reporter (提报人)';
  RAISE NOTICE '  - category (问题类别)';
  RAISE NOTICE '  - expected_fix_date (期望修复时间)';
  RAISE NOTICE '  - status (状态)';
  RAISE NOTICE '  - description (描述)';
  RAISE NOTICE '  - audio_url (音频URL)';
  RAISE NOTICE '  - model_id (模型ID)';
  RAISE NOTICE '  - created_at (创建时间)';
  RAISE NOTICE '  - updated_at (更新时间)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ 已创建索引以提升查询性能';
  RAISE NOTICE '✅ 已启用行级安全策略 (RLS)';
  RAISE NOTICE '✅ 已设置公开访问权限';
  RAISE NOTICE '✅ 已启用 Realtime 实时同步';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 配置完成！现在可以使用了';
END $$;

SELECT 
  '✅ 表创建成功' as status,
  COUNT(*) as current_records 
FROM public.badcases;


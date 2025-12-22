-- ================================================
-- Badcase 表结构迁移脚本
-- ================================================
-- 说明：此脚本将更新 badcases 表以匹配前端 BadcaseData 类型
-- 在 Supabase SQL Editor 中执行
-- ================================================

-- 删除旧表（如果需要保留数据，请先备份！）
DROP TABLE IF EXISTS public.badcases CASCADE;

-- 创建新的 badcases 表（匹配前端 BadcaseData 类型）
CREATE TABLE public.badcases (
    -- 主键
    id TEXT PRIMARY KEY,
    
    -- 基本信息
    date TEXT NOT NULL,                    -- 提交日期 (YYYY-MM-DD)
    subject TEXT,                          -- 学科 (chinese, math, english, physics, chemistry)
    category TEXT NOT NULL,                -- 分类（读音错误、停顿不当等）
    description TEXT NOT NULL,             -- 问题描述
    
    -- 出现位置相关
    location TEXT,                         -- 出现位置: 'fullTTS' 或 'interactive'
    full_tts_lesson_id TEXT,              -- 全程TTS课节ID (当location为fullTTS时)
    cms_id TEXT,                          -- CMS课节ID (当location为interactive时)
    model_id TEXT,                        -- 问题模型ID
    
    -- 人员和时间
    reporter TEXT,                        -- 问题提报人
    expected_fix_date TEXT NOT NULL,      -- 期望修复时间 (YYYY-MM-DD)
    
    -- 状态管理
    status TEXT NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending', 'processing', 'resolved', 'algorithm_processing', 'engineering_processing')),
    
    -- 音频
    audio_url TEXT,                       -- 音频文件URL
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_badcases_status ON public.badcases(status);
CREATE INDEX idx_badcases_category ON public.badcases(category);
CREATE INDEX idx_badcases_subject ON public.badcases(subject);
CREATE INDEX idx_badcases_date ON public.badcases(date DESC);
CREATE INDEX idx_badcases_created_at ON public.badcases(created_at DESC);
CREATE INDEX idx_badcases_location ON public.badcases(location);

-- 创建全文搜索索引
CREATE INDEX idx_badcases_description ON public.badcases USING gin(to_tsvector('simple', description));

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

-- 启用 RLS（行级安全）- 允许公开访问
ALTER TABLE public.badcases ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read access" 
ON public.badcases 
FOR SELECT 
USING (true);

-- 创建策略：允许所有人插入（根据需要可以改为认证用户）
CREATE POLICY "Allow public insert" 
ON public.badcases 
FOR INSERT 
WITH CHECK (true);

-- 创建策略：允许所有人更新
CREATE POLICY "Allow public update" 
ON public.badcases 
FOR UPDATE 
USING (true);

-- 创建策略：允许所有人删除
CREATE POLICY "Allow public delete" 
ON public.badcases 
FOR DELETE 
USING (true);

-- ================================================
-- 执行完成！
-- ================================================
-- 验证步骤：
-- 1. 在左侧菜单点击 "Table Editor"
-- 2. 查看 "badcases" 表
-- 3. 确认表结构正确
-- ================================================

SELECT '✅ Badcases 表迁移成功！' AS message;
SELECT '📊 当前记录数：' || COUNT(*) AS record_count FROM public.badcases;


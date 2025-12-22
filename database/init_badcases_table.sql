-- ================================================
-- 语音 Badcase 平台 - 数据库初始化脚本
-- ================================================
-- 说明：在 Supabase SQL Editor 中执行此脚本
-- 执行后将创建 badcases 表及相关索引
-- ================================================

-- 1. 创建 badcases 表
CREATE TABLE IF NOT EXISTS public.badcases (
    -- 主键
    id TEXT PRIMARY KEY,
    
    -- 基本信息
    problem_text TEXT NOT NULL,
    audio_url TEXT,
    problem_description TEXT NOT NULL,
    detail_description TEXT,
    
    -- 分类和优先级
    priority TEXT NOT NULL CHECK (priority IN ('P00', 'P0', 'P1', 'P2')),
    status TEXT NOT NULL CHECK (status IN ('修复中', '待确认', '已上线并验证', '已关闭', '停顿')),
    
    -- 反馈信息
    feedback_source TEXT,
    feedback_date TEXT,
    feedback_person TEXT,
    creator TEXT,
    
    -- 扩展字段
    subject TEXT,              -- 学科（语文、数学、英语等）
    model_version TEXT,        -- 模型版本（v1.0, v2.0等）
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_badcases_status ON public.badcases(status);
CREATE INDEX IF NOT EXISTS idx_badcases_priority ON public.badcases(priority);
CREATE INDEX IF NOT EXISTS idx_badcases_created_at ON public.badcases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badcases_feedback_date ON public.badcases(feedback_date);
CREATE INDEX IF NOT EXISTS idx_badcases_subject ON public.badcases(subject);
CREATE INDEX IF NOT EXISTS idx_badcases_model_version ON public.badcases(model_version);

-- 3. 创建全文搜索索引（用于问题文本和描述的搜索）
CREATE INDEX IF NOT EXISTS idx_badcases_problem_text ON public.badcases USING gin(to_tsvector('simple', problem_text));
CREATE INDEX IF NOT EXISTS idx_badcases_problem_description ON public.badcases USING gin(to_tsvector('simple', problem_description));

-- 4. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_badcases_updated_at ON public.badcases;
CREATE TRIGGER update_badcases_updated_at
    BEFORE UPDATE ON public.badcases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用行级安全策略 (RLS) - 可选
-- 如果需要用户认证和权限控制，取消下面的注释
-- ALTER TABLE public.badcases ENABLE ROW LEVEL SECURITY;

-- 创建允许所有人读取的策略（公开访问）
-- CREATE POLICY "Allow public read access" ON public.badcases
--     FOR SELECT
--     USING (true);

-- 创建允许认证用户写入的策略
-- CREATE POLICY "Allow authenticated users to insert" ON public.badcases
--     FOR INSERT
--     WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update" ON public.badcases
--     FOR UPDATE
--     USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete" ON public.badcases
--     FOR DELETE
--     USING (auth.role() = 'authenticated');

-- 6. 插入一些示例数据（可选）
INSERT INTO public.badcases (id, problem_text, problem_description, priority, status, subject, model_version, feedback_source, feedback_date, creator)
VALUES 
    ('BADCASE-001', '识别错误：将"好的"识别为"号的"', '语音识别准确率问题，高频词汇识别错误', 'P0', '修复中', '语文', 'v1.0', '用户反馈', '2024-12-01', '张三'),
    ('BADCASE-002', '停顿处理不当：句子中间有明显停顿但未断句', '在长句子中检测不到自然停顿，导致句子过长', 'P1', '待确认', '英语', 'v1.1', '测试团队', '2024-12-05', '李四'),
    ('BADCASE-003', '数学公式识别失败', '对于数学符号和公式的识别准确率低', 'P00', '修复中', '数学', 'v2.0', '内部测试', '2024-12-10', '王五')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 执行完成！
-- ================================================
-- 验证步骤：
-- 1. 在左侧菜单点击 "Table Editor"
-- 2. 查看 "badcases" 表
-- 3. 确认表结构和示例数据
-- ================================================

SELECT '✅ Badcases 表创建成功！' AS message;
SELECT '📊 当前记录数：' || COUNT(*) AS record_count FROM public.badcases;


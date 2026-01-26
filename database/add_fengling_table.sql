-- 为风灵业务方向创建独立的数据表
-- 表结构与 badcases 表相同，但数据完全独立

CREATE TABLE IF NOT EXISTS badcases_fengling (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    subject TEXT,
    location TEXT,
    full_tts_lesson_id TEXT,
    cms_id TEXT,
    reporter TEXT,
    category TEXT NOT NULL,
    expected_fix_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'algorithm_processing', 'engineering_processing', 'resolved', 'processing')),
    priority TEXT CHECK (priority IN ('P00', 'P0', 'P1', 'P2')),
    description TEXT NOT NULL,
    audio_url TEXT,
    video_url TEXT,
    model_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_badcases_fengling_status ON badcases_fengling(status);
CREATE INDEX IF NOT EXISTS idx_badcases_fengling_priority ON badcases_fengling(priority);
CREATE INDEX IF NOT EXISTS idx_badcases_fengling_date ON badcases_fengling(date);
CREATE INDEX IF NOT EXISTS idx_badcases_fengling_subject ON badcases_fengling(subject);
CREATE INDEX IF NOT EXISTS idx_badcases_fengling_category ON badcases_fengling(category);

-- 为现有的 badcases 表添加业务方向字段（可选，用于标识数据来源）
ALTER TABLE badcases ADD COLUMN IF NOT EXISTS business TEXT DEFAULT 'next';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_badcases_business ON badcases(business);

-- 注释说明
COMMENT ON TABLE badcases IS 'Next业务方向的Badcase数据表';
COMMENT ON TABLE badcases_fengling IS '风灵业务方向的Badcase数据表';

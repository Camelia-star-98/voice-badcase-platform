-- ========================================
-- 🛠️ 一键修复：添加所有缺失的字段
-- ========================================
-- 这个脚本会：
-- 1. 检查并添加所有必需的字段
-- 2. 刷新 Supabase schema cache
-- 3. 验证修复结果
-- ========================================

-- 步骤 1: 添加 date 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'date'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN date TEXT NOT NULL DEFAULT '';
        RAISE NOTICE '✅ 已添加 date 字段';
    ELSE
        RAISE NOTICE 'ℹ️  date 字段已存在';
    END IF;
END $$;

-- 步骤 2: 添加 subject 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'subject'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN subject TEXT;
        RAISE NOTICE '✅ 已添加 subject 字段';
    ELSE
        RAISE NOTICE 'ℹ️  subject 字段已存在';
    END IF;
END $$;

-- 步骤 3: 添加 location 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'location'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN location TEXT;
        RAISE NOTICE '✅ 已添加 location 字段';
    ELSE
        RAISE NOTICE 'ℹ️  location 字段已存在';
    END IF;
END $$;

-- 步骤 4: 添加 full_tts_lesson_id 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'full_tts_lesson_id'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN full_tts_lesson_id TEXT;
        RAISE NOTICE '✅ 已添加 full_tts_lesson_id 字段';
    ELSE
        RAISE NOTICE 'ℹ️  full_tts_lesson_id 字段已存在';
    END IF;
END $$;

-- 步骤 5: 添加 cms_id 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'cms_id'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN cms_id TEXT;
        RAISE NOTICE '✅ 已添加 cms_id 字段';
    ELSE
        RAISE NOTICE 'ℹ️  cms_id 字段已存在';
    END IF;
END $$;

-- 步骤 6: 添加 reporter 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'reporter'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN reporter TEXT;
        RAISE NOTICE '✅ 已添加 reporter 字段';
    ELSE
        RAISE NOTICE 'ℹ️  reporter 字段已存在';
    END IF;
END $$;

-- 步骤 7: 添加 expected_fix_date 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'expected_fix_date'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN expected_fix_date TEXT NOT NULL DEFAULT '';
        RAISE NOTICE '✅ 已添加 expected_fix_date 字段';
    ELSE
        RAISE NOTICE 'ℹ️  expected_fix_date 字段已存在';
    END IF;
END $$;

-- 步骤 8: 添加 audio_url 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'audio_url'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN audio_url TEXT;
        RAISE NOTICE '✅ 已添加 audio_url 字段';
    ELSE
        RAISE NOTICE 'ℹ️  audio_url 字段已存在';
    END IF;
END $$;

-- 步骤 9: 添加 model_id 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'badcases' 
          AND column_name = 'model_id'
    ) THEN
        ALTER TABLE public.badcases ADD COLUMN model_id TEXT;
        RAISE NOTICE '✅ 已添加 model_id 字段';
    ELSE
        RAISE NOTICE 'ℹ️  model_id 字段已存在';
    END IF;
END $$;

-- 步骤 10: 刷新 PostgREST schema cache（重要！）
NOTIFY pgrst, 'reload schema';

-- 步骤 11: 验证所有字段
SELECT 
    '✅ 修复后的表结构' AS info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'badcases'
ORDER BY ordinal_position;

-- 步骤 12: 最终提示
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '🎉 所有字段已检查并添加完成！';
    RAISE NOTICE '';
    RAISE NOTICE '📝 接下来请：';
    RAISE NOTICE '  1. 在前端强制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）';
    RAISE NOTICE '  2. 清除浏览器缓存';
    RAISE NOTICE '  3. 如果问题仍存在：';
    RAISE NOTICE '     - 访问 Supabase Dashboard';
    RAISE NOTICE '     - Settings > API > Restart now';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 现在你填写的字段应该可以被其他人看到了！';
    RAISE NOTICE '';
END $$;


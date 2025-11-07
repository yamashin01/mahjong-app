-- ============================================================================
-- 023_add_oka_to_game_results.sql
-- game_resultsテーブルにokaカラムを追加
-- ============================================================================

-- okaカラムを追加
ALTER TABLE public.game_results
ADD COLUMN IF NOT EXISTS oka INTEGER NOT NULL DEFAULT 0;

-- コメント追加
COMMENT ON COLUMN public.game_results.oka IS 'オカ';

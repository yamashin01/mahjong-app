-- ============================================================================
-- 024_remove_tobi_prize_from_game_results.sql
-- game_resultsテーブルからtobi_prizeカラムを削除
-- ============================================================================

-- tobi_prizeカラムを削除
ALTER TABLE public.game_results
DROP COLUMN IF EXISTS tobi_prize;

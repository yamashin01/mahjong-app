-- ============================================================================
-- 029_drop_unused_views.sql
-- 未使用のビューを削除
-- ============================================================================

-- daily_rankingsビューを削除（アプリで使用されていない）
DROP VIEW IF EXISTS public.daily_rankings;

-- group_statisticsビューを削除（アプリで使用されていない）
DROP VIEW IF EXISTS public.group_statistics;

-- コメント
COMMENT ON SCHEMA public IS '未使用のランキングビュー（daily_rankings, group_statistics）を削除。ランキング機能はアプリケーション側でgame_resultsテーブルから直接集計する。';

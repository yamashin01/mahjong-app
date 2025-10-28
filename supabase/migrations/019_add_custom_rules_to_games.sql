-- ============================================================================
-- 019_add_custom_rules_to_games.sql
-- gamesテーブルにカスタムルール用のカラムを追加
-- イベント内で対局ごとにルールを変更可能にする
-- ============================================================================

-- カスタムルールカラムを追加（NULLの場合はグループのデフォルトルールを使用）
ALTER TABLE public.games
ADD COLUMN custom_start_points INTEGER,
ADD COLUMN custom_return_points INTEGER,
ADD COLUMN custom_uma_first INTEGER,
ADD COLUMN custom_uma_second INTEGER,
ADD COLUMN custom_uma_third INTEGER,
ADD COLUMN custom_uma_fourth INTEGER,
ADD COLUMN custom_rate NUMERIC(10, 2);

-- コメント追加
COMMENT ON COLUMN public.games.custom_start_points IS 'カスタム開始持ち点（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_return_points IS 'カスタム返し持ち点（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_uma_first IS 'カスタムウマ1位（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_uma_second IS 'カスタムウマ2位（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_uma_third IS 'カスタムウマ3位（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_uma_fourth IS 'カスタムウマ4位（NULL = グループルール使用）';
COMMENT ON COLUMN public.games.custom_rate IS 'カスタムレート（NULL = グループルール使用）';

-- ============================================================================
-- 020_add_rules_to_events.sql
-- eventsテーブルにルール設定用のカラムを追加
-- イベント単位でルールを設定可能にする
-- ============================================================================

-- イベントルールカラムを追加（NULLの場合はグループのデフォルトルールを使用）
ALTER TABLE public.events
ADD COLUMN game_type TEXT CHECK (game_type IN ('tonpuu', 'tonnan')),
ADD COLUMN start_points INTEGER,
ADD COLUMN return_points INTEGER,
ADD COLUMN uma_first INTEGER,
ADD COLUMN uma_second INTEGER,
ADD COLUMN uma_third INTEGER,
ADD COLUMN uma_fourth INTEGER,
ADD COLUMN oka_enabled BOOLEAN,
ADD COLUMN rate NUMERIC(10, 2),
ADD COLUMN tobi_prize INTEGER,
ADD COLUMN yakuman_prize INTEGER,
ADD COLUMN top_prize INTEGER;

-- コメント追加
COMMENT ON COLUMN public.events.game_type IS 'イベントのゲーム種別（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.start_points IS 'イベントの開始持ち点（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.return_points IS 'イベントの返し持ち点（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.uma_first IS 'イベントのウマ1位（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.uma_second IS 'イベントのウマ2位（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.uma_third IS 'イベントのウマ3位（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.uma_fourth IS 'イベントのウマ4位（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.oka_enabled IS 'イベントのオカ有効フラグ（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.rate IS 'イベントのレート（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.tobi_prize IS 'イベントのトビ賞（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.yakuman_prize IS 'イベントの役満賞（NULL = グループルール使用）';
COMMENT ON COLUMN public.events.top_prize IS 'イベントのトップ賞（NULL = グループルール使用）';

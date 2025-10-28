-- ============================================================================
-- 018_add_event_id_to_games.sql
-- gamesテーブルにevent_idカラムを追加
-- ============================================================================

-- event_idカラムを追加（NULL可能 = イベント外の通常対局）
ALTER TABLE public.games
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_games_event_id ON public.games(event_id);

-- コメント追加
COMMENT ON COLUMN public.games.event_id IS 'イベントID（NULL = 通常対局）';

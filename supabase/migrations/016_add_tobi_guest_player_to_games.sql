-- ============================================================================
-- 016_add_tobi_guest_player_to_games.sql
-- gamesテーブルにtobi_guest_player_idカラムを追加
-- ============================================================================

-- tobi_guest_player_idカラムを追加
ALTER TABLE public.games
  ADD COLUMN tobi_guest_player_id UUID REFERENCES public.guest_players(id) ON DELETE SET NULL;

-- インデックス追加
CREATE INDEX idx_games_tobi_guest_player_id ON public.games(tobi_guest_player_id);

-- コメント
COMMENT ON COLUMN public.games.tobi_guest_player_id IS 'トビしたゲストメンバーID（tobi_player_idまたはtobi_guest_player_idのどちらか一方または両方nullも可能）';

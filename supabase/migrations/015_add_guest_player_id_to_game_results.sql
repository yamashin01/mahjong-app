-- ============================================================================
-- 015_add_guest_player_id_to_game_results.sql
-- game_resultsテーブルにguest_player_idカラムを追加
-- ============================================================================

-- guest_player_idカラムを追加
ALTER TABLE public.game_results
  ADD COLUMN guest_player_id UUID REFERENCES public.guest_players(id) ON DELETE CASCADE;

-- player_idをnullableに変更
ALTER TABLE public.game_results
  ALTER COLUMN player_id DROP NOT NULL;

-- player_idまたはguest_player_idのどちらか一方のみが設定されていることを保証するチェック制約
ALTER TABLE public.game_results
  ADD CONSTRAINT game_results_player_check CHECK (
    (player_id IS NOT NULL AND guest_player_id IS NULL) OR
    (player_id IS NULL AND guest_player_id IS NOT NULL)
  );

-- インデックス追加
CREATE INDEX idx_game_results_guest_player_id ON public.game_results(guest_player_id);

-- コメント
COMMENT ON COLUMN public.game_results.guest_player_id IS 'ゲストメンバーID（player_idまたはguest_player_idのどちらか一方のみ設定）';

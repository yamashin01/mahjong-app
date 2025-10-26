-- ============================================================================
-- 012_add_game_results_profiles_foreign_key.sql
-- game_resultsからprofilesへの外部キー制約を追加
-- ============================================================================

-- 既存の外部キー制約を削除
ALTER TABLE public.game_results
  DROP CONSTRAINT IF EXISTS game_results_player_id_fkey;

-- profilesテーブルへの外部キー制約を追加
ALTER TABLE public.game_results
  ADD CONSTRAINT game_results_player_id_fkey
  FOREIGN KEY (player_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- コメント追加
COMMENT ON CONSTRAINT game_results_player_id_fkey ON public.game_results IS '対局結果のプレイヤーIDはprofilesテーブルを参照';

-- ============================================================================
-- 021_fix_game_results_unique_constraint.sql
-- game_resultsテーブルのユニーク制約を修正してゲストプレイヤーに対応
-- ============================================================================

-- 問題:
-- 元のユニーク制約 UNIQUE(game_id, player_id) は、複数のゲストプレイヤーが
-- 同じゲームに参加する場合に問題を引き起こします。
-- ゲストプレイヤーの場合、player_id = NULL となるため、
-- (game_id, NULL) の組み合わせが重複してしまいます。

-- 解決策:
-- 古い制約を削除し、通常プレイヤーとゲストプレイヤー用の
-- 個別のパーシャルユニークインデックスを作成します。

-- 既存のユニーク制約を削除
ALTER TABLE public.game_results
  DROP CONSTRAINT IF EXISTS game_results_game_id_player_id_key;

-- 通常プレイヤー用のユニークインデックス
-- player_id が NULL でない場合のみ適用
CREATE UNIQUE INDEX IF NOT EXISTS game_results_game_regular_player_unique
  ON public.game_results(game_id, player_id)
  WHERE player_id IS NOT NULL;

-- ゲストプレイヤー用のユニークインデックス
-- guest_player_id が NULL でない場合のみ適用
CREATE UNIQUE INDEX IF NOT EXISTS game_results_game_guest_player_unique
  ON public.game_results(game_id, guest_player_id)
  WHERE guest_player_id IS NOT NULL;

-- コメント
COMMENT ON INDEX public.game_results_game_regular_player_unique IS '通常プレイヤーの重複を防ぐ: 同じゲームに同じプレイヤーは1回のみ参加可能';
COMMENT ON INDEX public.game_results_game_guest_player_unique IS 'ゲストプレイヤーの重複を防ぐ: 同じゲームに同じゲストプレイヤーは1回のみ参加可能';

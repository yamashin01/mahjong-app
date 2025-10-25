-- ============================================================================
-- 006_create_game_results.sql
-- 半荘結果テーブルの作成とRLSポリシー設定
-- ============================================================================

-- 半荘結果テーブル作成
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id),
  seat TEXT NOT NULL CHECK (seat IN ('east', 'south', 'west', 'north')),
  final_points INTEGER NOT NULL,
  raw_score INTEGER NOT NULL,
  uma INTEGER NOT NULL,
  rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 4),
  total_score NUMERIC(10,2) NOT NULL,
  point_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, player_id),
  UNIQUE(game_id, seat)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON public.game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_player_id ON public.game_results(player_id);

-- RLS有効化
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: グループメンバーは結果を閲覧可能
CREATE POLICY "game_results_select_member" ON public.game_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_results.game_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは結果を作成可能
CREATE POLICY "game_results_insert_member" ON public.game_results
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_results.game_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは結果を更新可能
CREATE POLICY "game_results_update_member" ON public.game_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_results.game_id
        AND group_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_results.game_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは結果を削除可能
CREATE POLICY "game_results_delete_member" ON public.game_results
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      JOIN public.group_members ON group_members.group_id = games.group_id
      WHERE games.id = game_results.game_id
        AND group_members.user_id = auth.uid()
    )
  );

-- コメント追加
COMMENT ON TABLE public.game_results IS '各プレイヤーの半荘結果';
COMMENT ON COLUMN public.game_results.seat IS '座席 (east/south/west/north)';
COMMENT ON COLUMN public.game_results.final_points IS '最終持ち点';
COMMENT ON COLUMN public.game_results.raw_score IS '素点（返し点からの差分）';
COMMENT ON COLUMN public.game_results.uma IS 'ウマ';
COMMENT ON COLUMN public.game_results.rank IS '順位 (1-4)';
COMMENT ON COLUMN public.game_results.total_score IS 'ウマオカ込みのスコア';
COMMENT ON COLUMN public.game_results.point_amount IS 'レート適用後のポイント';

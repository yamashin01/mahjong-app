-- ============================================================================
-- 005_create_games.sql
-- 半荘記録テーブルの作成とRLSポリシー設定
-- ============================================================================

-- 半荘記録テーブル作成
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('tonpuu', 'tonnan')),
  game_number INTEGER NOT NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  tobi_player_id UUID REFERENCES auth.users(id),
  yakuman_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_games_group_id ON public.games(group_id);
CREATE INDEX IF NOT EXISTS idx_games_played_at ON public.games(played_at);
CREATE INDEX IF NOT EXISTS idx_games_recorded_by ON public.games(recorded_by);

-- RLS有効化
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: グループメンバーは半荘を閲覧可能
CREATE POLICY "games_select_member" ON public.games
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは半荘を作成可能
CREATE POLICY "games_insert_member" ON public.games
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは半荘を更新可能
CREATE POLICY "games_update_member" ON public.games
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーは半荘を削除可能
CREATE POLICY "games_delete_member" ON public.games
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = games.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- コメント追加
COMMENT ON TABLE public.games IS '半荘記録';
COMMENT ON COLUMN public.games.game_type IS '東風/東南 (tonpuu/tonnan)';
COMMENT ON COLUMN public.games.game_number IS 'その日の何回戦目か';
COMMENT ON COLUMN public.games.recorded_by IS '記録者ID';
COMMENT ON COLUMN public.games.tobi_player_id IS 'トビしたプレイヤーID';
COMMENT ON COLUMN public.games.yakuman_count IS '役満の回数';

-- ============================================================================
-- 014_create_guest_players.sql
-- ゲストメンバー（Googleログインなしのプレイヤー）テーブル作成
-- ============================================================================

-- ゲストメンバーテーブル
CREATE TABLE IF NOT EXISTS public.guest_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT guest_players_name_check CHECK (char_length(name) > 0)
);

-- インデックス
CREATE INDEX idx_guest_players_group_id ON public.guest_players(group_id);

-- RLSポリシー有効化
ALTER TABLE public.guest_players ENABLE ROW LEVEL SECURITY;

-- ゲストメンバー閲覧: グループメンバーのみ
CREATE POLICY "Group members can view guest players"
  ON public.guest_players
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = guest_players.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- ゲストメンバー追加: グループ管理者のみ
CREATE POLICY "Group admins can insert guest players"
  ON public.guest_players
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = guest_players.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- ゲストメンバー更新: グループ管理者のみ
CREATE POLICY "Group admins can update guest players"
  ON public.guest_players
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = guest_players.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- ゲストメンバー削除: グループ管理者のみ
CREATE POLICY "Group admins can delete guest players"
  ON public.guest_players
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = guest_players.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- コメント
COMMENT ON TABLE public.guest_players IS 'Googleログインなしで対局に参加できるゲストメンバー';
COMMENT ON COLUMN public.guest_players.group_id IS '所属グループID';
COMMENT ON COLUMN public.guest_players.name IS 'ゲストメンバー名';

-- updated_at自動更新トリガー
CREATE TRIGGER guest_players_updated_at
  BEFORE UPDATE ON public.guest_players
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

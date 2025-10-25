-- ============================================================================
-- 004_create_group_members.sql
-- グループメンバーテーブルの作成とRLSポリシー設定
-- ============================================================================

-- グループメンバーテーブル作成
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- RLS有効化
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: グループメンバーは自グループのメンバー一覧を閲覧可能
CREATE POLICY "group_members_select_member" ON public.group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members AS gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

-- RLSポリシー: ユーザーは招待リンク経由でグループ参加可能
CREATE POLICY "group_members_insert_self" ON public.group_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: グループ管理者のみメンバーのロール変更可能
CREATE POLICY "group_members_update_admin" ON public.group_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members AS gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members AS gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  );

-- RLSポリシー: 自分自身の退出 or 管理者による削除が可能
CREATE POLICY "group_members_delete_self_or_admin" ON public.group_members
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.group_members AS gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  );

-- コメント追加
COMMENT ON TABLE public.group_members IS 'グループメンバー情報';
COMMENT ON COLUMN public.group_members.role IS 'ロール (admin/member)';
COMMENT ON COLUMN public.group_members.joined_at IS '参加日時';

-- ============================================================================
-- 先行テーブルのRLSポリシーを追加（group_membersテーブル作成後）
-- ============================================================================

-- groupsテーブル: グループメンバーのみ閲覧可能
CREATE POLICY "groups_select_member" ON public.groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

-- group_rulesテーブル: グループメンバーはルール閲覧可能
CREATE POLICY "group_rules_select_member" ON public.group_rules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_rules.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- group_rulesテーブル: グループ作成者のみルール作成可能
CREATE POLICY "group_rules_insert_admin" ON public.group_rules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_rules.group_id
        AND groups.created_by = auth.uid()
    )
  );

-- group_rulesテーブル: グループ作成者のみルール更新可能
CREATE POLICY "group_rules_update_admin" ON public.group_rules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_rules.group_id
        AND groups.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_rules.group_id
        AND groups.created_by = auth.uid()
    )
  );

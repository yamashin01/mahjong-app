-- ============================================================================
-- 009_fix_group_members_rls.sql
-- group_membersテーブルのRLS無限再帰問題を修正
-- ============================================================================

-- 既存の問題のあるポリシーを削除
DROP POLICY IF EXISTS "group_members_select_member" ON public.group_members;

-- RLSをバイパスするセキュリティ定義関数を作成
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
$$;

-- 新しいポリシー: セキュリティ関数を使用して無限再帰を回避
CREATE POLICY "group_members_select_member" ON public.group_members
  FOR SELECT
  USING (is_group_member(group_id, auth.uid()));

-- コメント追加
COMMENT ON FUNCTION public.is_group_member(UUID, UUID) IS 'グループメンバーシップを確認（RLSバイパス）';

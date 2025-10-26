-- ============================================================================
-- 011_complete_rls_fix.sql
-- RLSポリシーとトリガー関数の完全な修正
-- ============================================================================

-- ============================================================================
-- 1. ヘルパー関数の作成（SECURITY DEFINERでRLSをバイパス）
-- ============================================================================

-- is_group_admin関数の作成
CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_group_admin(UUID, UUID) IS 'グループ管理者権限を確認（RLSバイパス）';

-- ============================================================================
-- 2. トリガー関数の修正（group_membersを先に作成してRLS違反を回避）
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 先にグループ作成者を管理者として追加
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');

  -- その後、デフォルトのグループルールを作成
  INSERT INTO public.group_rules (group_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. groupsテーブルのRLSポリシー再作成
-- ============================================================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "groups_insert_authenticated" ON public.groups;
DROP POLICY IF EXISTS "groups_select_member" ON public.groups;
DROP POLICY IF EXISTS "groups_update_creator" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_creator" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "groups_delete" ON public.groups;

-- 新しいポリシーを作成
CREATE POLICY "groups_insert" ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "groups_select" ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    is_group_member(id, auth.uid()) OR
    invite_code IS NOT NULL
  );

CREATE POLICY "groups_update" ON public.groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_delete" ON public.groups
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================================================
-- 4. group_membersテーブルのRLSポリシー再作成
-- ============================================================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "group_members_select_member" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert_self" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update_admin" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_self_or_admin" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert" ON public.group_members;
DROP POLICY IF EXISTS "group_members_update" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete" ON public.group_members;

-- 新しいポリシーを作成
CREATE POLICY "group_members_select" ON public.group_members
  FOR SELECT
  TO authenticated
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "group_members_insert" ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_update" ON public.group_members
  FOR UPDATE
  TO authenticated
  USING (is_group_admin(group_id, auth.uid()))
  WITH CHECK (is_group_admin(group_id, auth.uid()));

CREATE POLICY "group_members_delete" ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_group_admin(group_id, auth.uid())
  );

-- ============================================================================
-- 5. group_rulesテーブルのRLSポリシー再作成
-- ============================================================================

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "group_rules_select_member" ON public.group_rules;
DROP POLICY IF EXISTS "group_rules_insert_admin" ON public.group_rules;
DROP POLICY IF EXISTS "group_rules_update_admin" ON public.group_rules;
DROP POLICY IF EXISTS "group_rules_select" ON public.group_rules;
DROP POLICY IF EXISTS "group_rules_insert" ON public.group_rules;
DROP POLICY IF EXISTS "group_rules_update" ON public.group_rules;

-- 新しいポリシーを作成
CREATE POLICY "group_rules_select" ON public.group_rules
  FOR SELECT
  TO authenticated
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "group_rules_insert" ON public.group_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (is_group_admin(group_id, auth.uid()));

CREATE POLICY "group_rules_update" ON public.group_rules
  FOR UPDATE
  TO authenticated
  USING (is_group_admin(group_id, auth.uid()))
  WITH CHECK (is_group_admin(group_id, auth.uid()));

-- ============================================================================
-- コメント
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_group() IS 'グループ作成時に管理者メンバーとルールを自動作成（順序修正版）';

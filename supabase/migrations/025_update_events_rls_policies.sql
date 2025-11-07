-- ============================================================================
-- 025_update_events_rls_policies.sql
-- イベントテーブルのRLSポリシーを更新: 管理者のみ → 全メンバー
-- ============================================================================

-- 既存の管理者専用ポリシーを削除
DROP POLICY IF EXISTS "events_update_admin" ON public.events;
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;

-- 新しいポリシー: グループメンバー全員がイベントを更新可能
CREATE POLICY "events_update_member" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- 新しいポリシー: グループメンバー全員がイベントを削除可能
CREATE POLICY "events_delete_member" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
    )
  );

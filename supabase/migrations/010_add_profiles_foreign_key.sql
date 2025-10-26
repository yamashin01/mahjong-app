-- ============================================================================
-- 010_add_profiles_foreign_key.sql
-- group_membersからprofilesへの外部キー制約を追加
-- ============================================================================

-- 既存の外部キー制約を削除
ALTER TABLE public.group_members
  DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- profilesテーブルへの外部キー制約を追加
ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- コメント追加
COMMENT ON CONSTRAINT group_members_user_id_fkey ON public.group_members IS 'グループメンバーのユーザーIDはprofilesテーブルを参照';

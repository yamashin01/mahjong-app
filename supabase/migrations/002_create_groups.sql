-- ============================================================================
-- 002_create_groups.sql
-- グループテーブルの作成とRLSポリシー設定
-- ============================================================================

-- 招待コード生成関数
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 紛らわしい文字を除外
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- グループテーブル作成
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT generate_invite_code(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code);

-- RLS有効化
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- NOTE: グループメンバーのみ閲覧可能なSELECTポリシーは、
-- group_membersテーブル作成後の004_create_group_members.sqlで設定

-- RLSポリシー: ログインユーザーはグループ作成可能
CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLSポリシー: グループ作成者のみ更新可能
CREATE POLICY "groups_update_creator" ON public.groups
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLSポリシー: グループ作成者のみ削除可能
CREATE POLICY "groups_delete_creator" ON public.groups
  FOR DELETE
  USING (auth.uid() = created_by);

-- コメント追加
COMMENT ON TABLE public.groups IS '麻雀グループ情報';
COMMENT ON COLUMN public.groups.name IS 'グループ名';
COMMENT ON COLUMN public.groups.description IS 'グループ説明';
COMMENT ON COLUMN public.groups.created_by IS '作成者ID';
COMMENT ON COLUMN public.groups.invite_code IS '招待コード（8文字ランダム）';

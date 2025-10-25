-- ============================================================================
-- 001_create_profiles.sql
-- プロファイルテーブルの作成とRLSポリシー設定
-- ============================================================================

-- プロファイルテーブル作成
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- RLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が全プロファイルを閲覧可能（メンバー一覧表示のため）
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT
  USING (true);

-- RLSポリシー: 自分のプロファイルのみ更新可能
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- コメント追加
COMMENT ON TABLE public.profiles IS 'ユーザープロファイル情報';
COMMENT ON COLUMN public.profiles.id IS 'ユーザーID（auth.usersの主キー）';
COMMENT ON COLUMN public.profiles.display_name IS '表示名';
COMMENT ON COLUMN public.profiles.avatar_url IS 'プロフィール画像URL';

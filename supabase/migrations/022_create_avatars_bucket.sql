-- ============================================================================
-- 022_create_avatars_bucket.sql
-- プロフィール画像保存用Storageバケットの作成
-- ============================================================================

-- avatarsバケットの作成（public: 全員が閲覧可能）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- アップロードポリシー: 認証済みユーザーが自分のフォルダにアップロード可能
CREATE POLICY "avatars_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 更新ポリシー: 自分のファイルのみ更新可能
CREATE POLICY "avatars_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 削除ポリシー: 自分のファイルのみ削除可能
CREATE POLICY "avatars_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 閲覧ポリシー: 全員が全ての画像を閲覧可能
CREATE POLICY "avatars_select_all"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- コメント
COMMENT ON POLICY "avatars_insert_own" ON storage.objects IS 'ユーザーは自分のアバター画像をアップロードできる';
COMMENT ON POLICY "avatars_update_own" ON storage.objects IS 'ユーザーは自分のアバター画像を更新できる';
COMMENT ON POLICY "avatars_delete_own" ON storage.objects IS 'ユーザーは自分のアバター画像を削除できる';
COMMENT ON POLICY "avatars_select_all" ON storage.objects IS '全員がアバター画像を閲覧できる';

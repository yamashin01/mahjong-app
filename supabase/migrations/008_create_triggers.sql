-- ============================================================================
-- 008_create_triggers.sql
-- トリガー関数とトリガーの作成
-- ============================================================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profilesテーブルのupdated_atトリガー
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- groupsテーブルのupdated_atトリガー
CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- group_rulesテーブルのupdated_atトリガー
CREATE TRIGGER group_rules_updated_at
  BEFORE UPDATE ON public.group_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- gamesテーブルのupdated_atトリガー
CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- グループ作成時にデフォルトルールを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_group()
RETURNS TRIGGER AS $$
BEGIN
  -- デフォルトのグループルールを作成
  INSERT INTO public.group_rules (group_id)
  VALUES (NEW.id);

  -- グループ作成者を管理者として追加
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- グループ作成トリガー
CREATE TRIGGER on_group_created
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_group();

-- 新規ユーザー登録時にプロファイルを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'ユーザー'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザー作成トリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- コメント追加
COMMENT ON FUNCTION public.handle_updated_at() IS 'updated_atカラムを自動更新';
COMMENT ON FUNCTION public.handle_new_group() IS 'グループ作成時にデフォルトルールと管理者メンバーを自動作成';
COMMENT ON FUNCTION public.handle_new_user() IS '新規ユーザー登録時にプロファイルを自動作成';

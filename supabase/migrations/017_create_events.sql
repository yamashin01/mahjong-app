-- ============================================================================
-- 017_create_events.sql
-- イベントテーブルの作成とRLSポリシー設定
-- ============================================================================

-- イベントテーブル作成
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_events_group_id ON public.events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

-- RLS有効化
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: グループメンバーはイベントを閲覧可能
CREATE POLICY "events_select_member" ON public.events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループメンバーはイベントを作成可能
CREATE POLICY "events_insert_member" ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
    )
  );

-- RLSポリシー: グループ管理者のみイベントを更新可能
CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- RLSポリシー: グループ管理者のみイベントを削除可能
CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = events.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'
    )
  );

-- コメント追加
COMMENT ON TABLE public.events IS 'イベント（大会・合宿など）';
COMMENT ON COLUMN public.events.name IS 'イベント名';
COMMENT ON COLUMN public.events.description IS 'イベント説明';
COMMENT ON COLUMN public.events.event_date IS 'イベント開催日';
COMMENT ON COLUMN public.events.status IS 'ステータス（active: 進行中, completed: 完了）';
COMMENT ON COLUMN public.events.created_by IS 'イベント作成者ID';

-- ============================================================================
-- 003_create_group_rules.sql
-- グループルールテーブルの作成とRLSポリシー設定
-- ============================================================================

-- グループルールテーブル作成
CREATE TABLE IF NOT EXISTS public.group_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID UNIQUE NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL DEFAULT 'tonnan' CHECK (game_type IN ('tonpuu', 'tonnan')),
  start_points INTEGER NOT NULL DEFAULT 25000,
  return_points INTEGER NOT NULL DEFAULT 30000,
  uma_first INTEGER NOT NULL DEFAULT 20,
  uma_second INTEGER NOT NULL DEFAULT 10,
  uma_third INTEGER NOT NULL DEFAULT -10,
  uma_fourth INTEGER NOT NULL DEFAULT -20,
  oka_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  rate NUMERIC(10,2) NOT NULL DEFAULT 1.0,
  tobi_prize INTEGER DEFAULT 0,
  yakuman_prize INTEGER DEFAULT 0,
  top_prize INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_group_rules_group_id ON public.group_rules(group_id);

-- RLS有効化
ALTER TABLE public.group_rules ENABLE ROW LEVEL SECURITY;

-- NOTE: RLSポリシーは、group_membersテーブル作成後の
-- 004_create_group_members.sqlで設定

-- コメント追加
COMMENT ON TABLE public.group_rules IS 'グループのルール設定';
COMMENT ON COLUMN public.group_rules.game_type IS '東風/東南 (tonpuu/tonnan)';
COMMENT ON COLUMN public.group_rules.start_points IS '開始点数';
COMMENT ON COLUMN public.group_rules.return_points IS '返し点';
COMMENT ON COLUMN public.group_rules.rate IS 'レート（点棒1000点あたりのポイント）';

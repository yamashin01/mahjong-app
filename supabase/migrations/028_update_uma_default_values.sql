-- ============================================================================
-- 028_update_uma_default_values.sql
-- グループルールのウマのデフォルト値を変更（1位10000点、2位5000点に）
-- ============================================================================

-- group_rulesテーブルのデフォルト値を変更
ALTER TABLE public.group_rules
  ALTER COLUMN uma_first SET DEFAULT 10000,
  ALTER COLUMN uma_second SET DEFAULT 5000,
  ALTER COLUMN uma_third SET DEFAULT -5000,
  ALTER COLUMN uma_fourth SET DEFAULT -10000;

-- 既存のデフォルト値（20, 10, -10, -20）を持つレコードを新しい値に更新
UPDATE public.group_rules
SET
  uma_first = 10000,
  uma_second = 5000,
  uma_third = -5000,
  uma_fourth = -10000
WHERE
  uma_first = 20
  AND uma_second = 10
  AND uma_third = -10
  AND uma_fourth = -20;

-- コメント更新
COMMENT ON COLUMN public.group_rules.uma_first IS 'ウマ1位（点棒単位）デフォルト10000点';
COMMENT ON COLUMN public.group_rules.uma_second IS 'ウマ2位（点棒単位）デフォルト5000点';
COMMENT ON COLUMN public.group_rules.uma_third IS 'ウマ3位（点棒単位）デフォルト-5000点';
COMMENT ON COLUMN public.group_rules.uma_fourth IS 'ウマ4位（点棒単位）デフォルト-10000点';

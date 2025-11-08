-- Add yakitori_prize column to group_rules table
ALTER TABLE group_rules
ADD COLUMN yakitori_prize INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN group_rules.yakitori_prize IS 'ヤキトリ賞（焼き鳥賞）のポイント';

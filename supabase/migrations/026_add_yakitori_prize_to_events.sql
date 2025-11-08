-- Add yakitori_prize column to events table
ALTER TABLE events
ADD COLUMN yakitori_prize INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN events.yakitori_prize IS 'ヤキトリ賞（焼き鳥賞）のポイント';

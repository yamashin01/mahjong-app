-- ============================================================================
-- 007_create_views.sql
-- 集計ビューの作成
-- ============================================================================

-- 日別ランキングビュー
CREATE OR REPLACE VIEW public.daily_rankings AS
SELECT
  g.group_id,
  g.played_at::date AS game_date,
  gr.player_id,
  p.display_name,
  COUNT(gr.id) AS games_played,
  SUM(gr.point_amount) AS total_points,
  AVG(gr.rank) AS average_rank,
  COUNT(CASE WHEN gr.rank = 1 THEN 1 END) AS first_place_count,
  COUNT(CASE WHEN gr.rank = 2 THEN 1 END) AS second_place_count,
  COUNT(CASE WHEN gr.rank = 3 THEN 1 END) AS third_place_count,
  COUNT(CASE WHEN gr.rank = 4 THEN 1 END) AS fourth_place_count
FROM public.games g
JOIN public.game_results gr ON gr.game_id = g.id
LEFT JOIN public.profiles p ON p.id = gr.player_id
GROUP BY g.group_id, game_date, gr.player_id, p.display_name;

-- グループ統計ビュー
CREATE OR REPLACE VIEW public.group_statistics AS
SELECT
  g.group_id,
  gr.player_id,
  p.display_name,
  COUNT(gr.id) AS total_games,
  SUM(gr.point_amount) AS total_points,
  AVG(gr.point_amount) AS average_points,
  AVG(gr.rank) AS average_rank,
  COUNT(CASE WHEN gr.rank = 1 THEN 1 END) AS first_place_count,
  COUNT(CASE WHEN gr.rank = 2 THEN 1 END) AS second_place_count,
  COUNT(CASE WHEN gr.rank = 3 THEN 1 END) AS third_place_count,
  COUNT(CASE WHEN gr.rank = 4 THEN 1 END) AS fourth_place_count,
  ROUND(
    COUNT(CASE WHEN gr.rank = 1 THEN 1 END)::numeric / NULLIF(COUNT(gr.id), 0) * 100,
    2
  ) AS first_place_rate,
  COUNT(CASE WHEN g.tobi_player_id = gr.player_id THEN 1 END) AS tobi_count,
  MAX(g.played_at) AS last_played_at
FROM public.games g
JOIN public.game_results gr ON gr.game_id = g.id
LEFT JOIN public.profiles p ON p.id = gr.player_id
GROUP BY g.group_id, gr.player_id, p.display_name;

-- コメント追加
COMMENT ON VIEW public.daily_rankings IS '日別のプレイヤーランキング集計';
COMMENT ON VIEW public.group_statistics IS 'グループ全体の累計統計';

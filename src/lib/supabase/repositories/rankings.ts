import { createClient } from "@/lib/supabase/server";

/**
 * 今日のランキングを取得する
 */
export async function getDailyRankings(params: { groupId: string; gameDate: string }) {
  const supabase = await createClient();
  return await supabase
    .from("daily_rankings")
    .select("*")
    .eq("group_id", params.groupId)
    .eq("game_date", params.gameDate);
}

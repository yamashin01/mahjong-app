import { createClient } from "@/lib/supabase/server";

/**
 * イベントを作成する
 */
export async function createEvent(eventData: {
    group_id: string;
    name: string;
    description: string;
    event_date: string;
    created_by: string;
    status: "active" | "completed";
    // カスタムルール（オプショナル）
    game_type?: "tonpuu" | "tonnan";
    start_points?: number;
    return_points?: number;
    uma_first?: number;
    uma_second?: number;
    uma_third?: number;
    uma_fourth?: number;
    oka_enabled?: boolean;
    rate?: number;
    tobi_prize?: number;
    yakuman_prize?: number;
    top_prize?: number;
  }) {
  const supabase = await createClient();
  return (await supabase
    .from("events" as any)
    .insert(eventData)
    .select()
    .single()) as any;
}

/**
 * イベントのステータスを更新する
 */
export async function updateEventStatus(params: {
  eventId: string;
  status: "active" | "completed";
}) {
  const supabase = await createClient();
  return (await supabase
    .from("events" as any)
    .update({
      status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.eventId)
    .select("group_id")
    .single()) as any;
}

/**
 * イベントルールを更新する
 */
export async function updateEventRules(params: {
    eventId: string;
    gameType: string | null;
    startPoints: number | null;
    returnPoints: number | null;
    umaFirst: number | null;
    umaSecond: number | null;
    umaThird: number | null;
    umaFourth: number | null;
    okaEnabled: boolean | null;
    rate: number | null;
    tobiPrize: number | null;
    yakumanPrize: number | null;
    topPrize: number | null;
  }) {
  const supabase = await createClient();
  const updateData = {
    game_type: params.gameType,
    start_points: params.startPoints,
    return_points: params.returnPoints,
    uma_first: params.umaFirst,
    uma_second: params.umaSecond,
    uma_third: params.umaThird,
    uma_fourth: params.umaFourth,
    oka_enabled: params.okaEnabled,
    rate: params.rate,
    tobi_prize: params.tobiPrize,
    yakuman_prize: params.yakumanPrize,
    top_prize: params.topPrize,
    updated_at: new Date().toISOString(),
  };

  return (await supabase
    .from("events" as any)
    .update(updateData)
    .eq("id", params.eventId)
    .select("group_id")
    .single()) as any;
}

/**
 * イベントを削除する
 */
export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  return await supabase.from("events" as any).delete().eq("id", eventId);
}

/**
 * イベントを取得する
 */
export async function getEventById(eventId: string) {
  const supabase = await createClient();
  return (await supabase
    .from("events" as any)
    .select("*")
    .eq("id", eventId)
    .single()) as any;
}

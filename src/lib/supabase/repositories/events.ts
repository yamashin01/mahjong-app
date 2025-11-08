import { createClient } from "@/lib/supabase/server";
import type { EventInsert, EventUpdate } from "@/types";

/**
 * イベントを作成する
 */
export async function createEvent(eventData: EventInsert) {
  const supabase = await createClient();
  return await supabase.from("events").insert(eventData).select().single();
}

/**
 * イベントのステータスを更新する
 */
export async function updateEventStatus(params: {
  eventId: string;
  status: "active" | "completed";
}) {
  const supabase = await createClient();
  return await supabase
    .from("events")
    .update({
      status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.eventId)
    .select("group_id")
    .single();
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
  rate: number | null;
  tobiPrize: number | null;
  yakumanPrize: number | null;
  yakitoriPrize: number | null;
  topPrize: number | null;
}) {
  const supabase = await createClient();

  // オカは返し点が開始点より大きい場合に自動的に有効
  // nullの場合はnullのまま（グループルールを継承）
  let okaEnabled: boolean | null = null;
  if (params.startPoints !== null && params.returnPoints !== null) {
    okaEnabled = params.returnPoints > params.startPoints;
  }

  const updateData: EventUpdate = {
    game_type: params.gameType,
    start_points: params.startPoints,
    return_points: params.returnPoints,
    oka_enabled: okaEnabled,
    uma_first: params.umaFirst,
    uma_second: params.umaSecond,
    uma_third: params.umaThird,
    uma_fourth: params.umaFourth,
    rate: params.rate,
    tobi_prize: params.tobiPrize,
    yakuman_prize: params.yakumanPrize,
    yakitori_prize: params.yakitoriPrize,
    top_prize: params.topPrize,
    updated_at: new Date().toISOString(),
  };

  return await supabase
    .from("events")
    .update(updateData)
    .eq("id", params.eventId)
    .select("group_id")
    .single();
}

/**
 * イベントを削除する
 */
export async function deleteEvent(eventId: string) {
  const supabase = await createClient();
  return await supabase.from("events").delete().eq("id", eventId);
}

/**
 * イベントを取得する
 */
export async function getEventById(eventId: string) {
  const supabase = await createClient();
  return await supabase.from("events").select("*").eq("id", eventId).single();
}

/**
 * グループのイベント一覧を取得する
 */
export async function getGroupEvents(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("events")
    .select("*")
    .eq("group_id", groupId)
    .order("event_date", { ascending: false });
}

/**
 * グループのアクティブなイベント一覧を取得する
 */
export async function getActiveGroupEvents(groupId: string) {
  const supabase = await createClient();
  return await supabase
    .from("events")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", "active")
    .order("event_date", { ascending: false });
}

/**
 * イベント名を更新する
 */
export async function updateEventName(params: { eventId: string; name: string }) {
  const supabase = await createClient();
  return await supabase
    .from("events")
    .update({
      name: params.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.eventId)
    .select("group_id")
    .single();
}

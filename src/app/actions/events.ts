"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import * as eventsRepo from "@/lib/supabase/repositories/events";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const eventDate = formData.get("eventDate") as string;

  // カスタムルール設定
  const useCustomRules = formData.get("useCustomRules") === "true";

  if (!name || !eventDate) {
    return { error: "イベント名と開催日は必須です" };
  }

  // イベントデータを構築
  const eventData: any = {
    group_id: groupId,
    name,
    description,
    event_date: eventDate,
    created_by: user.id,
    status: "active",
  };

  // カスタムルールが有効な場合、ルール設定を追加
  if (useCustomRules) {
    const gameType = formData.get("game_type") as string;
    const startPoints = formData.get("start_points");
    const returnPoints = formData.get("return_points");
    const umaFirst = formData.get("uma_first");
    const umaSecond = formData.get("uma_second");
    const umaThird = formData.get("uma_third");
    const umaFourth = formData.get("uma_fourth");
    const okaEnabled = formData.get("oka_enabled");
    const rate = formData.get("rate");
    const tobiPrize = formData.get("tobi_prize");
    const yakumanPrize = formData.get("yakuman_prize");
    const topPrize = formData.get("top_prize");

    if (gameType) eventData.game_type = gameType;
    if (startPoints) eventData.start_points = Number(startPoints);
    if (returnPoints) eventData.return_points = Number(returnPoints);
    if (umaFirst) eventData.uma_first = Number(umaFirst);
    if (umaSecond) eventData.uma_second = Number(umaSecond);
    if (umaThird) eventData.uma_third = Number(umaThird);
    if (umaFourth) eventData.uma_fourth = Number(umaFourth);
    if (okaEnabled !== null) eventData.oka_enabled = okaEnabled === "true";
    if (rate) eventData.rate = Number(rate);
    if (tobiPrize) eventData.tobi_prize = Number(tobiPrize);
    if (yakumanPrize) eventData.yakuman_prize = Number(yakumanPrize);
    if (topPrize) eventData.top_prize = Number(topPrize);
  }

  // イベントを作成
  const { data: event, error } = await eventsRepo.createEvent(eventData);

  if (error) {
    console.error("Error creating event:", error);
    return { error: "イベントの作成に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}/events/${event.id}`);
}

export async function updateEventStatus(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const eventId = formData.get("eventId") as string;
  const status = formData.get("status") as "active" | "completed";

  // イベントを更新
  const { data: event, error } = await eventsRepo.updateEventStatus({
    eventId,
    status,
  });

  if (error) {
    console.error("Error updating event status:", error);
    return { error: "イベントステータスの更新に失敗しました" };
  }

  revalidatePath(`/groups/${event.group_id}`);
  revalidatePath(`/groups/${event.group_id}/events/${eventId}`);

  redirect(`/groups/${event.group_id}/events/${eventId}`);
}

export async function updateEventRules(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const eventId = formData.get("eventId") as string;
  const useCustomRules = formData.get("useCustomRules") === "true";

  // 更新データを構築
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (useCustomRules) {
    // カスタムルールが有効な場合、各フィールドを設定
    const gameType = formData.get("game_type") as string;
    const startPoints = formData.get("start_points");
    const returnPoints = formData.get("return_points");
    const umaFirst = formData.get("uma_first");
    const umaSecond = formData.get("uma_second");
    const umaThird = formData.get("uma_third");
    const umaFourth = formData.get("uma_fourth");
    const okaEnabled = formData.get("oka_enabled");
    const rate = formData.get("rate");
    const tobiPrize = formData.get("tobi_prize");
    const yakumanPrize = formData.get("yakuman_prize");
    const topPrize = formData.get("top_prize");

    updateData.game_type = gameType || null;
    updateData.start_points = startPoints ? Number(startPoints) : null;
    updateData.return_points = returnPoints ? Number(returnPoints) : null;
    updateData.uma_first = umaFirst ? Number(umaFirst) : null;
    updateData.uma_second = umaSecond ? Number(umaSecond) : null;
    updateData.uma_third = umaThird ? Number(umaThird) : null;
    updateData.uma_fourth = umaFourth ? Number(umaFourth) : null;
    updateData.oka_enabled = okaEnabled !== null ? okaEnabled === "true" : null;
    updateData.rate = rate ? Number(rate) : null;
    updateData.tobi_prize = tobiPrize ? Number(tobiPrize) : null;
    updateData.yakuman_prize = yakumanPrize ? Number(yakumanPrize) : null;
    updateData.top_prize = topPrize ? Number(topPrize) : null;
  } else {
    // カスタムルールが無効な場合、全てNULLにしてグループルールを使用
    updateData.game_type = null;
    updateData.start_points = null;
    updateData.return_points = null;
    updateData.uma_first = null;
    updateData.uma_second = null;
    updateData.uma_third = null;
    updateData.uma_fourth = null;
    updateData.oka_enabled = null;
    updateData.rate = null;
    updateData.tobi_prize = null;
    updateData.yakuman_prize = null;
    updateData.top_prize = null;
  }

  // イベントルールを更新
  const { data: event, error } = await eventsRepo.updateEventRules({
    eventId,
    gameType: updateData.game_type,
    startPoints: updateData.start_points,
    returnPoints: updateData.return_points,
    umaFirst: updateData.uma_first,
    umaSecond: updateData.uma_second,
    umaThird: updateData.uma_third,
    umaFourth: updateData.uma_fourth,
    okaEnabled: updateData.oka_enabled,
    rate: updateData.rate,
    tobiPrize: updateData.tobi_prize,
    yakumanPrize: updateData.yakuman_prize,
    topPrize: updateData.top_prize,
  });

  if (error) {
    console.error("Error updating event rules:", error);
    return { error: "イベントルールの更新に失敗しました" };
  }

  revalidatePath(`/groups/${event.group_id}`);
  revalidatePath(`/groups/${event.group_id}/events/${eventId}`);

  redirect(`/groups/${event.group_id}/events/${eventId}`);
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const eventId = formData.get("eventId") as string;
  const groupId = formData.get("groupId") as string;

  // イベントを削除（関連する対局のevent_idはON DELETE SET NULLで自動的にNULLになる）
  const { error } = await eventsRepo.deleteEvent(eventId);

  if (error) {
    console.error("Error deleting event:", error);
    return { error: "イベントの削除に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

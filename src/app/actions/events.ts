"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  if (!name || !eventDate) {
    return { error: "イベント名と開催日は必須です" };
  }

  // イベントを作成
  const { data: event, error } = (await supabase
    .from("events" as any)
    .insert({
      group_id: groupId,
      name,
      description,
      event_date: eventDate,
      created_by: user.id,
      status: "active",
    })
    .select()
    .single()) as any;

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
  const { data: event, error } = (await supabase
    .from("events" as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .select("group_id")
    .single()) as any;

  if (error) {
    console.error("Error updating event status:", error);
    return { error: "イベントステータスの更新に失敗しました" };
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
  const { error } = await supabase.from("events" as any).delete().eq("id", eventId);

  if (error) {
    console.error("Error deleting event:", error);
    return { error: "イベントの削除に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

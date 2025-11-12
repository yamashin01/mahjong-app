import * as eventsRepo from "@/lib/supabase/repositories/events";
import type {
  CreateEventInput,
  EventStatus,
  UpdateEventRules,
} from "@/lib/validation/event-schemas";

/**
 * Event service layer
 * Business logic for event operations
 */

type EventInsert = {
  group_id: string;
  name: string;
  description: string | null;
  event_date: string;
  created_by: string;
  status: string;
  game_type?: string;
  start_points?: number;
  return_points?: number;
  uma_first?: number;
  uma_second?: number;
  uma_third?: number;
  uma_fourth?: number;
  rate?: number;
  tobi_prize?: number;
  yakuman_prize?: number;
  top_prize?: number;
};

/**
 * Create a new event
 */
export async function createNewEvent(
  input: CreateEventInput,
  userId: string,
  customRules?: UpdateEventRules,
) {
  // イベントデータを構築
  const eventData: EventInsert = {
    group_id: input.groupId,
    name: input.name,
    description: input.description || null,
    event_date: input.startDate,
    created_by: userId,
    status: "active",
  };

  // カスタムルールが設定されている場合、ルール設定を追加
  if (customRules) {
    // 返し点は開始点以上である必要がある
    if (
      customRules.returnPoints !== undefined &&
      customRules.returnPoints !== null &&
      customRules.startPoints !== undefined &&
      customRules.startPoints !== null &&
      customRules.returnPoints < customRules.startPoints
    ) {
      throw new Error("返し点は開始点以上である必要があります");
    }

    if (customRules.gameType !== undefined) eventData.game_type = customRules.gameType ?? undefined;
    if (customRules.startPoints !== undefined)
      eventData.start_points = customRules.startPoints ?? undefined;
    if (customRules.returnPoints !== undefined)
      eventData.return_points = customRules.returnPoints ?? undefined;
    if (customRules.umaFirst !== undefined) eventData.uma_first = customRules.umaFirst ?? undefined;
    if (customRules.umaSecond !== undefined)
      eventData.uma_second = customRules.umaSecond ?? undefined;
    if (customRules.umaThird !== undefined) eventData.uma_third = customRules.umaThird ?? undefined;
    if (customRules.umaFourth !== undefined)
      eventData.uma_fourth = customRules.umaFourth ?? undefined;
    if (customRules.rate !== undefined) eventData.rate = customRules.rate ?? undefined;
    if (customRules.tobiPrize !== undefined)
      eventData.tobi_prize = customRules.tobiPrize ?? undefined;
    if (customRules.yakumanPrize !== undefined)
      eventData.yakuman_prize = customRules.yakumanPrize ?? undefined;
    if (customRules.topPrize !== undefined) eventData.top_prize = customRules.topPrize ?? undefined;
  }

  const { data: event, error } = await eventsRepo.createEvent(eventData);

  if (error || !event) {
    throw error || new Error("イベントの作成に失敗しました");
  }

  return event;
}

/**
 * Update event status
 */
export async function updateStatus(eventId: string, status: EventStatus) {
  const { data: event, error } = await eventsRepo.updateEventStatus({
    eventId,
    status,
  });

  if (error || !event) {
    throw error || new Error("イベントステータスの更新に失敗しました");
  }

  return event;
}

/**
 * Update event rules
 */
export async function updateRules(eventId: string, rules: UpdateEventRules) {
  // 返し点は開始点以上である必要がある
  if (
    rules.returnPoints !== undefined &&
    rules.returnPoints !== null &&
    rules.startPoints !== undefined &&
    rules.startPoints !== null &&
    rules.returnPoints < rules.startPoints
  ) {
    throw new Error("返し点は開始点以上である必要があります");
  }

  const { data: event, error } = await eventsRepo.updateEventRules({
    eventId,
    gameType: rules.gameType ?? null,
    startPoints: rules.startPoints ?? null,
    returnPoints: rules.returnPoints ?? null,
    umaFirst: rules.umaFirst ?? null,
    umaSecond: rules.umaSecond ?? null,
    umaThird: rules.umaThird ?? null,
    umaFourth: rules.umaFourth ?? null,
    rate: rules.rate ?? null,
    tobiPrize: rules.tobiPrize ?? null,
    yakumanPrize: rules.yakumanPrize ?? null,
    yakitoriPrize: null,
    topPrize: rules.topPrize ?? null,
  });

  if (error || !event) {
    throw error || new Error("イベントルールの更新に失敗しました");
  }

  return event;
}

/**
 * Update event name
 */
export async function updateName(eventId: string, name: string) {
  const { data: event, error } = await eventsRepo.updateEventName({
    eventId,
    name: name.trim(),
  });

  if (error || !event) {
    throw error || new Error("イベント名の更新に失敗しました");
  }

  return event;
}

/**
 * Update event description
 */
export async function updateDescription(eventId: string, description: string) {
  const { data: event, error } = await eventsRepo.updateEventDescription({
    eventId,
    description: description.trim(),
  });

  if (error || !event) {
    throw error || new Error("イベント説明の更新に失敗しました");
  }

  return event;
}

/**
 * Delete an event
 */
export async function deleteEventById(eventId: string) {
  const { error } = await eventsRepo.deleteEvent(eventId);

  if (error) {
    throw error;
  }
}

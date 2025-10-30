"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGame(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupId = formData.get("groupId") as string;
  const gameType = formData.get("gameType") as "tonpuu" | "tonnan";
  const playedAt = formData.get("playedAt") as string;
  const eventId = formData.get("eventId") as string | null;

  // 回戦数を自動採番（グループ内の最新の対局記録+1）
  const { data: latestGame } = await supabase
    .from("games")
    .select("game_number")
    .eq("group_id", groupId)
    .order("game_number", { ascending: false })
    .limit(1)
    .single();

  const gameNumber = latestGame ? latestGame.game_number + 1 : 1;

  // プレイヤーと点数のデータを取得
  const players = [];
  for (let i = 1; i <= 4; i++) {
    const playerId = formData.get(`player${i}Id`) as string;
    const finalPoints = Number.parseInt(formData.get(`player${i}FinalPoints`) as string, 10);

    if (!playerId || Number.isNaN(finalPoints)) {
      return { error: `プレイヤー${i}の情報が不足しています` };
    }

    players.push({ playerId, finalPoints });
  }

  // グループルールを取得
  const { data: groupRules } = await supabase
    .from("group_rules")
    .select("*")
    .eq("group_id", groupId)
    .single();

  if (!groupRules) {
    return { error: "グループルールが見つかりません" };
  }

  // イベントIDが指定されている場合、イベントルールを取得
  let rules = groupRules;
  if (eventId) {
    const { data: event } = (await supabase
      .from("events" as any)
      .select("*")
      .eq("id", eventId)
      .single()) as any;

    if (event) {
      // イベントにカスタムルールが設定されている場合は上書き
      rules = {
        ...groupRules,
        ...(event.game_type !== null && { game_type: event.game_type }),
        ...(event.start_points !== null && { start_points: event.start_points }),
        ...(event.return_points !== null && { return_points: event.return_points }),
        ...(event.uma_first !== null && { uma_first: event.uma_first }),
        ...(event.uma_second !== null && { uma_second: event.uma_second }),
        ...(event.uma_third !== null && { uma_third: event.uma_third }),
        ...(event.uma_fourth !== null && { uma_fourth: event.uma_fourth }),
        ...(event.oka_enabled !== null && { oka_enabled: event.oka_enabled }),
        ...(event.rate !== null && { rate: event.rate }),
        ...(event.tobi_prize !== null && { tobi_prize: event.tobi_prize }),
        ...(event.yakuman_prize !== null && { yakuman_prize: event.yakuman_prize }),
        ...(event.top_prize !== null && { top_prize: event.top_prize }),
      };
    }
  }

  // 順位を計算（点数の降順）
  const sortedPlayers = [...players].sort((a, b) => b.finalPoints - a.finalPoints);
  const playerRanks = new Map<string, number>();
  sortedPlayers.forEach((p, index) => {
    playerRanks.set(p.playerId, index + 1);
  });

  // 座席を自動割り当て
  const seats = ["east", "south", "west", "north"];

  // 各プレイヤーのスコアを計算
  const results = players.map((player, index) => {
    const rank = playerRanks.get(player.playerId) || 1;
    const rawScore = player.finalPoints - rules.return_points;

    // ゲストメンバーかどうかをチェック
    const isGuest = player.playerId.startsWith("guest-");
    const actualPlayerId = isGuest ? null : player.playerId;
    const guestPlayerId = isGuest ? player.playerId.replace("guest-", "") : null;

    // ウマの取得
    let uma = 0;
    switch (rank) {
      case 1:
        uma = rules.uma_first;
        break;
      case 2:
        uma = rules.uma_second;
        break;
      case 3:
        uma = rules.uma_third;
        break;
      case 4:
        uma = rules.uma_fourth;
        break;
    }

    // トータルスコア（素点/1000 + ウマ）
    const totalScore = rawScore / 1000 + uma;

    // ポイント額（レート適用）
    const pointAmount = totalScore * rules.rate;

    return {
      player_id: actualPlayerId,
      guest_player_id: guestPlayerId,
      seat: seats[index],
      final_points: player.finalPoints,
      raw_score: rawScore,
      uma,
      rank,
      total_score: totalScore,
      point_amount: pointAmount,
    };
  });

  // 対局記録を作成
  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      group_id: groupId,
      game_type: gameType,
      game_number: gameNumber,
      played_at: playedAt,
      recorded_by: user.id,
      event_id: eventId || null,
      tobi_player_id: null,
      tobi_guest_player_id: null,
      yakuman_count: 0,
    })
    .select()
    .single();

  if (gameError) {
    console.error("Error creating game:", gameError);
    return { error: "対局の作成に失敗しました" };
  }

  // 各プレイヤーの結果を保存
  const gameResults = results.map((result) => ({
    game_id: game.id,
    ...result,
  }));

  const { error: resultsError } = await supabase.from("game_results").insert(gameResults);

  if (resultsError) {
    console.error("Error creating game results:", resultsError);
    // ゲームを削除してロールバック
    await supabase.from("games").delete().eq("id", game.id);
    return { error: "対局結果の保存に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  if (eventId) {
    revalidatePath(`/groups/${groupId}/events/${eventId}`);
  }
  redirect(`/groups/${groupId}/games/${game.id}`);
}

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
  const gameNumber = Number.parseInt(formData.get("gameNumber") as string, 10);
  const playedAt = formData.get("playedAt") as string;
  const tobiPlayerId = formData.get("tobiPlayerId") as string | null;
  const yakumanCount = Number.parseInt(formData.get("yakumanCount") as string, 10);

  // プレイヤーと点数のデータを取得
  const players = [];
  for (let i = 1; i <= 4; i++) {
    const playerId = formData.get(`player${i}Id`) as string;
    const seat = formData.get(`player${i}Seat`) as string;
    const finalPoints = Number.parseInt(formData.get(`player${i}FinalPoints`) as string, 10);

    if (!playerId || !seat || Number.isNaN(finalPoints)) {
      return { error: `プレイヤー${i}の情報が不足しています` };
    }

    players.push({ playerId, seat, finalPoints });
  }

  // グループルールを取得
  const { data: rules } = await supabase
    .from("group_rules")
    .select("*")
    .eq("group_id", groupId)
    .single();

  if (!rules) {
    return { error: "グループルールが見つかりません" };
  }

  // 順位を計算（点数の降順）
  const sortedPlayers = [...players].sort((a, b) => b.finalPoints - a.finalPoints);
  const playerRanks = new Map<string, number>();
  sortedPlayers.forEach((p, index) => {
    playerRanks.set(p.playerId, index + 1);
  });

  // トビプレイヤーの処理
  let actualTobiPlayerId: string | null = null;
  let actualTobiGuestPlayerId: string | null = null;
  if (tobiPlayerId && tobiPlayerId.startsWith("guest-")) {
    actualTobiGuestPlayerId = tobiPlayerId.replace("guest-", "");
  } else if (tobiPlayerId) {
    actualTobiPlayerId = tobiPlayerId;
  }

  // 各プレイヤーのスコアを計算
  const results = players.map((player) => {
    const rank = playerRanks.get(player.playerId) || 1;
    const rawScore = player.finalPoints - rules.return_points;

    // ゲストプレイヤーかどうかをチェック
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
      seat: player.seat,
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
      tobi_player_id: actualTobiPlayerId,
      tobi_guest_player_id: actualTobiGuestPlayerId,
      yakuman_count: yakumanCount,
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

  const { error: resultsError } = await supabase
    .from("game_results")
    .insert(gameResults);

  if (resultsError) {
    console.error("Error creating game results:", resultsError);
    // ゲームを削除してロールバック
    await supabase.from("games").delete().eq("id", game.id);
    return { error: "対局結果の保存に失敗しました" };
  }

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}/games/${game.id}`);
}

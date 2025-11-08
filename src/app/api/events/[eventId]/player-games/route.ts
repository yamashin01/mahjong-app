import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get("playerId") || null;
  const guestPlayerId = searchParams.get("guestPlayerId") || null;

  // 空文字列をnullに変換
  const actualPlayerId = playerId && playerId !== "" ? playerId : null;
  const actualGuestPlayerId = guestPlayerId && guestPlayerId !== "" ? guestPlayerId : null;

  if (!actualPlayerId && !actualGuestPlayerId) {
    return NextResponse.json({ error: "Player ID required" }, { status: 400 });
  }

  const supabase = await createClient();

  // プレイヤーの対局結果を取得
  let query = supabase
    .from("game_results")
    .select(
      `
      rank,
      raw_score,
      point_amount,
      uma,
      oka,
      game_id,
      games!inner(
        game_number,
        game_type,
        played_at,
        event_id
      )
    `,
    )
    .eq("games.event_id", eventId);

  if (actualPlayerId) {
    query = query.eq("player_id", actualPlayerId);
  } else if (actualGuestPlayerId) {
    query = query.eq("guest_player_id", actualGuestPlayerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // データを整形してソート
  const games = data
    .map((result) => {
      const game = Array.isArray(result.games) ? result.games[0] : result.games;
      return {
        gameNumber: game.game_number,
        gameDate: new Date(game.played_at).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        gameType: game.game_type,
        rank: result.rank,
        rawScore: result.raw_score,
        pointAmount: result.point_amount,
        uma: result.uma,
        oka: result.oka,
        playedAt: game.played_at, // ソート用
      };
    })
    .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime())
    .map(({ playedAt, ...game }) => game); // playedAtを除外

  return NextResponse.json({ games });
}

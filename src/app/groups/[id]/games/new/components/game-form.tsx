"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createGame } from "@/app/actions/games";
import { getPlayerDisplayName } from "@/lib/utils/player";

interface GameFormProps {
  groupId: string;
  eventId?: string;
  rules: {
    game_type: string;
    start_points: number;
    return_points: number;
    uma_first: number;
    uma_second: number;
    uma_third: number;
    uma_fourth: number;
    oka_enabled: boolean;
    rate: number;
  };
  members: Array<{ user_id: string; profiles: { display_name: string | null } | null }> | null;
  guestPlayers: Array<{ id: string; name: string }> | null;
  events: Array<{ id: string; name: string; event_date: string }> | null;
  defaultPlayers: (string | null)[];
}

export function GameForm({
  groupId,
  eventId,
  rules,
  members,
  guestPlayers,
  events,
  defaultPlayers,
}: GameFormProps) {
  const [finalPoints, setFinalPoints] = useState<number[]>([
    rules.start_points,
    rules.start_points,
    rules.start_points,
    rules.start_points,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const seatNames = ["東", "南", "西", "北"];
  const totalPoints = finalPoints.reduce((sum, points) => sum + points, 0);
  const expectedTotal = rules.start_points * 4;
  const isValidTotal = totalPoints === expectedTotal;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 合計点のチェック
    if (!isValidTotal) {
      setError(
        `合計点が一致しません。4人の合計: ${totalPoints.toLocaleString()}点、必要な合計: ${expectedTotal.toLocaleString()}点`,
      );
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createGame(formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // 成功の場合はリダイレクトされるのでローディング状態を保持
  };

  const handlePointsChange = (index: number, valueStr: string) => {
    const newPoints = [...finalPoints];
    const value = Number(valueStr);
    // NaNの場合（"-"のみや空文字など）は0として扱う（表示用のみ）
    newPoints[index] = Number.isNaN(value) ? 0 : value;
    setFinalPoints(newPoints);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="groupId" value={groupId} />

      {/* 対局情報 */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-6 bg-white">
        <h2 className="text-lg font-semibold">対局情報</h2>

        {/* イベント選択 */}
        {eventId ? (
          <input type="hidden" name="eventId" value={eventId} />
        ) : (
          events &&
          events.length > 0 && (
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
                イベント（任意）
              </label>
              <select
                id="eventId"
                name="eventId"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              >
                <option value="">イベントなし</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({new Date(event.event_date).toLocaleDateString("ja-JP")})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                イベントに紐付けると、イベント内の対局として記録されます
              </p>
            </div>
          )
        )}

        {/* 対局種別 */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            対局種別 <span className="text-red-500">*</span>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gameType"
                value="tonpuu"
                defaultChecked={rules.game_type === "tonpuu"}
                className="mr-2"
              />
              東風戦
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gameType"
                value="tonnan"
                defaultChecked={rules.game_type === "tonnan"}
                className="mr-2"
              />
              東南戦
            </label>
          </div>
        </div>
      </div>

      {/* プレイヤースコア */}
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h2 className="text-lg font-semibold mb-6">プレイヤースコア</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-gray-50 p-4 space-y-4">
              <h3 className="font-medium">{seatNames[i - 1]}</h3>

              {/* プレイヤー選択 */}
              <div>
                <label
                  htmlFor={`player${i}Id`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  プレイヤー <span className="text-red-500">*</span>
                </label>
                <select
                  id={`player${i}Id`}
                  name={`player${i}Id`}
                  required
                  defaultValue={defaultPlayers[i - 1] || ""}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                >
                  <option value="">選択してください</option>
                  <optgroup label="メンバー">
                    {members?.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {getPlayerDisplayName(member)}
                      </option>
                    ))}
                  </optgroup>
                  {guestPlayers && guestPlayers.length > 0 && (
                    <optgroup label="ゲストメンバー">
                      {guestPlayers.map((guest) => (
                        <option key={`guest-${guest.id}`} value={`guest-${guest.id}`}>
                          {guest.name} (ゲスト)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* 最終持ち点 */}
              <div>
                <label
                  htmlFor={`player${i}FinalPoints`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  最終持ち点 <span className="text-red-500">*</span>
                </label>
                <input
                  ref={(el) => {
                    inputRefs.current[i - 1] = el;
                  }}
                  type="number"
                  id={`player${i}FinalPoints`}
                  name={`player${i}FinalPoints`}
                  required
                  min="-999900"
                  step="100"
                  defaultValue={finalPoints[i - 1]}
                  onChange={(e) => handlePointsChange(i - 1, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 合計点表示 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">合計点:</span>
            <span
              className={`font-mono text-lg font-bold ${
                isValidTotal ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalPoints.toLocaleString()}点
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>必要な合計:</span>
            <span className="font-mono">{expectedTotal.toLocaleString()}点</span>
          </div>
          {!isValidTotal && (
            <p className="text-sm text-red-600 mt-2">
              差分: {totalPoints - expectedTotal > 0 ? "+" : ""}
              {(totalPoints - expectedTotal).toLocaleString()}点
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">注意事項</h3>
        <ul className="list-disc text-sm text-yellow-800 space-y-1 px-2">
          <li>4人の最終持ち点の合計が開始点の合計と一致する必要があります</li>
          <li>席は必ずしも席順通りに保存する必要はありません</li>
          <li>持ち点がマイナスになった場合は負の数値を入力してください</li>
          <li>トビ賞や役満賞等のボーナス点は最終持ち点に反映して下さい</li>
          <li>ウマやオカはシステム側で自動計算されますので、最終持ち点には含めないでください</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !isValidTotal}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "登録中..." : "対局を登録"}
        </button>
        <Link
          href={eventId ? `/groups/${groupId}/events/${eventId}` : `/groups/${groupId}`}
          className="flex-1 rounded-lg bg-gray-200 px-6 py-3 text-gray-700 font-medium hover:bg-gray-300 transition-colors text-center"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}

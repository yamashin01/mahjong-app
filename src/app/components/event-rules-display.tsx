import type { EventRules } from "@/types/event-rules";

interface EventRulesDisplayProps {
  eventRules: EventRules;
  groupRules: {
    game_type: string;
    start_points: number;
    return_points: number;
    uma_first: number;
    uma_second: number;
    uma_third: number;
    uma_fourth: number;
    oka_enabled: boolean;
    rate: number;
    tobi_prize: number | null;
    yakuman_prize: number | null;
  };
}

export function EventRulesDisplay({ eventRules, groupRules }: EventRulesDisplayProps) {
  // イベントにカスタムルールが設定されているかチェック
  const hasCustomRules = eventRules.game_type !== undefined && eventRules.game_type !== null;

  // 表示用のルールを決定（カスタムルールがあればそれを、なければグループルール）
  const displayRules = {
    game_type: eventRules.game_type ?? groupRules.game_type,
    start_points: eventRules.start_points ?? groupRules.start_points,
    return_points: eventRules.return_points ?? groupRules.return_points,
    uma_first: eventRules.uma_first ?? groupRules.uma_first,
    uma_second: eventRules.uma_second ?? groupRules.uma_second,
    uma_third: eventRules.uma_third ?? groupRules.uma_third,
    uma_fourth: eventRules.uma_fourth ?? groupRules.uma_fourth,
    oka_enabled: eventRules.oka_enabled ?? groupRules.oka_enabled,
    rate: eventRules.rate ?? groupRules.rate,
    tobi_prize: eventRules.tobi_prize ?? groupRules.tobi_prize ?? 0,
    yakuman_prize: eventRules.yakuman_prize ?? groupRules.yakuman_prize ?? 0,
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">適用ルール</h2>
        {!hasCustomRules && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            グループデフォルト
          </span>
        )}
        {hasCustomRules && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            イベント専用ルール
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本設定 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-1">基本設定</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">対局種別</span>
              <span className="font-medium">
                {displayRules.game_type === "tonpuu" ? "東風戦" : "東南戦"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">開始持ち点</span>
              <span className="font-medium">{displayRules.start_points.toLocaleString()}点</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">返し持ち点</span>
              <span className="font-medium">{displayRules.return_points.toLocaleString()}点</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">オカ</span>
              <span className="font-medium">{displayRules.oka_enabled ? "あり" : "なし"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">レート(1.0なら1000点あたり100pt)</span>
              <span className="font-medium">{displayRules.rate}pt</span>
            </div>
          </div>
        </div>

        {/* ウマ・トビ賞・役満賞など */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-1">各種賞金（任意）</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ウマ</span>
              <span className="font-medium">
                {displayRules.uma_first} / {displayRules.uma_second}
              </span>
            </div>
            {displayRules.tobi_prize > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">トビ賞</span>
                <span className="font-medium">{displayRules.tobi_prize}点</span>
              </div>
            )}
            {displayRules.yakuman_prize > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">役満賞</span>
                <span className="font-medium">{displayRules.yakuman_prize}点</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { EventRules } from "@/types/event-rules";

interface PointsInputsForEventProps {
  defaultStartPoints: number;
  defaultReturnPoints: number;
}

function PointsInputsForEvent({
  defaultStartPoints,
  defaultReturnPoints,
}: PointsInputsForEventProps) {
  const [startPoints, setStartPoints] = useState(defaultStartPoints);
  const [returnPoints, setReturnPoints] = useState(defaultReturnPoints);
  const [error, setError] = useState("");

  const handleStartPointsChange = (value: number) => {
    setStartPoints(value);
    if (returnPoints < value) {
      setError("返し点は開始点以上である必要があります");
    } else {
      setError("");
    }
  };

  const handleReturnPointsChange = (value: number) => {
    setReturnPoints(value);
    if (value < startPoints) {
      setError("返し点は開始点以上である必要があります");
    } else {
      setError("");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="start_points" className="block text-sm font-medium text-gray-700 mb-2">
          開始持ち点
        </label>
        <input
          type="number"
          id="start_points"
          name="start_points"
          value={startPoints}
          onChange={(e) => handleStartPointsChange(Number(e.target.value))}
          step="1000"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="return_points" className="block text-sm font-medium text-gray-700 mb-2">
          返し持ち点
        </label>
        <input
          type="number"
          id="return_points"
          name="return_points"
          value={returnPoints}
          onChange={(e) => handleReturnPointsChange(Number(e.target.value))}
          step="1000"
          className={`w-full rounded-lg border px-4 py-2 focus:ring-2 outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

interface UmaInputsForEventProps {
  defaultFirst: number;
  defaultSecond: number;
}

function UmaInputsForEvent({ defaultFirst, defaultSecond }: UmaInputsForEventProps) {
  const [umaFirst, setUmaFirst] = useState(defaultFirst);
  const [umaSecond, setUmaSecond] = useState(defaultSecond);

  return (
    <div>
      <div className="block text-sm font-medium text-gray-700 mb-2">ウマ（点棒）</div>
      <p className="text-xs text-gray-500 mb-3">
        1000点単位で指定してください。1位と2位の設定で3位と4位が自動計算されます。
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="uma_first" className="block text-xs text-gray-600 mb-1">
            1位
          </label>
          <div className="relative">
            <input
              type="number"
              id="uma_first"
              name="uma_first"
              min="0"
              step="1000"
              value={umaFirst}
              onChange={(e) => setUmaFirst(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="uma_second" className="block text-xs text-gray-600 mb-1">
            2位
          </label>
          <div className="relative">
            <input
              type="number"
              id="uma_second"
              name="uma_second"
              min="0"
              step="1000"
              value={umaSecond}
              onChange={(e) => setUmaSecond(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <span className="font-medium">自動計算：</span>
        3位 = -{umaSecond}点 / 4位 = -{umaFirst}点
      </div>
      <input type="hidden" name="uma_third" value={-umaSecond} />
      <input type="hidden" name="uma_fourth" value={-umaFirst} />
    </div>
  );
}

interface EventRulesFormProps {
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
    top_prize: number | null;
  };
  initialRules?: EventRules;
  mode?: "create" | "edit";
}

export function EventRulesForm({ groupRules, initialRules, mode = "create" }: EventRulesFormProps) {
  const [useCustomRules, setUseCustomRules] = useState(
    mode === "edit" ? initialRules?.game_type !== undefined : false,
  );

  return (
    <div className="space-y-6">
      {/* カスタムルール有効化チェックボックス */}
      <div className="flex items-center gap-3">
        {/* hidden input to ensure useCustomRules is always sent */}
        <input type="hidden" name="useCustomRules" value="false" />
        <input
          type="checkbox"
          id="useCustomRules"
          name="useCustomRules"
          value="true"
          checked={useCustomRules}
          onChange={(e) => setUseCustomRules(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="useCustomRules" className="text-sm font-medium text-gray-700">
          このイベント専用のルールを設定する
        </label>
      </div>

      {!useCustomRules && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">グループのデフォルトルールが使用されます</p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>• {groupRules.game_type === "tonpuu" ? "東風戦" : "東南戦"}</p>
            <p>
              • {groupRules.start_points}点持ち / {groupRules.return_points}点返し
            </p>
            <p>
              • ウマ: {groupRules.uma_first}/{groupRules.uma_second}/{groupRules.uma_third}/
              {groupRules.uma_fourth}
            </p>
            <p>• レート: {groupRules.rate}</p>
          </div>
        </div>
      )}

      {useCustomRules && (
        <div className="space-y-4">
          {/* 対局種別 */}
          <div>
            <label htmlFor="game_type" className="block text-sm font-medium text-gray-700 mb-2">
              対局種別
            </label>
            <select
              id="game_type"
              name="game_type"
              defaultValue={initialRules?.game_type || groupRules.game_type}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            >
              <option value="tonpuu">東風戦</option>
              <option value="tonnan">東南戦</option>
            </select>
          </div>

          {/* 基本点数設定 */}
          <PointsInputsForEvent
            defaultStartPoints={initialRules?.start_points || groupRules.start_points}
            defaultReturnPoints={initialRules?.return_points || groupRules.return_points}
          />

          {/* ウマ設定 */}
          <UmaInputsForEvent
            defaultFirst={initialRules?.uma_first || groupRules.uma_first}
            defaultSecond={initialRules?.uma_second || groupRules.uma_second}
          />

          {/* オカ設定 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="oka_enabled"
              name="oka_enabled"
              value="true"
              defaultChecked={
                initialRules?.oka_enabled !== undefined
                  ? (initialRules.oka_enabled ?? false)
                  : (groupRules.oka_enabled ?? false)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="oka_enabled" className="text-sm font-medium text-gray-700">
              オカを有効にする
            </label>
          </div>

          {/* レート */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
              レート（点棒1000点あたりのポイント）
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              defaultValue={initialRules?.rate || groupRules.rate}
              step="0.1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
          </div>

          {/* 各種賞金 */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">各種賞金（任意）</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tobi_prize" className="block text-xs text-gray-600 mb-1">
                  トビ賞
                </label>
                <input
                  type="number"
                  id="tobi_prize"
                  name="tobi_prize"
                  defaultValue={initialRules?.tobi_prize || groupRules.tobi_prize || 0}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="yakuman_prize" className="block text-xs text-gray-600 mb-1">
                  役満賞
                </label>
                <input
                  type="number"
                  id="yakuman_prize"
                  name="yakuman_prize"
                  defaultValue={initialRules?.yakuman_prize || groupRules.yakuman_prize || 0}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

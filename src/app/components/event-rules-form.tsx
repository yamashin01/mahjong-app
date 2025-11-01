"use client";

import { useState } from "react";
import type { EventRules } from "@/types/event-rules";

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_points"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                開始持ち点
              </label>
              <input
                type="number"
                id="start_points"
                name="start_points"
                defaultValue={initialRules?.start_points || groupRules.start_points}
                step="1000"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            <div>
              <label
                htmlFor="return_points"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                返し持ち点
              </label>
              <input
                type="number"
                id="return_points"
                name="return_points"
                defaultValue={initialRules?.return_points || groupRules.return_points}
                step="1000"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
          </div>

          {/* ウマ設定 */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">ウマ（順位点）</div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label htmlFor="uma_first" className="block text-xs text-gray-600 mb-1">
                  1位
                </label>
                <input
                  type="number"
                  id="uma_first"
                  name="uma_first"
                  defaultValue={initialRules?.uma_first || groupRules.uma_first}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="uma_second" className="block text-xs text-gray-600 mb-1">
                  2位
                </label>
                <input
                  type="number"
                  id="uma_second"
                  name="uma_second"
                  defaultValue={initialRules?.uma_second || groupRules.uma_second}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="uma_third" className="block text-xs text-gray-600 mb-1">
                  3位
                </label>
                <input
                  type="number"
                  id="uma_third"
                  name="uma_third"
                  defaultValue={initialRules?.uma_third || groupRules.uma_third}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="uma_fourth" className="block text-xs text-gray-600 mb-1">
                  4位
                </label>
                <input
                  type="number"
                  id="uma_fourth"
                  name="uma_fourth"
                  defaultValue={initialRules?.uma_fourth || groupRules.uma_fourth}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>
          </div>

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
            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <label htmlFor="top_prize" className="block text-xs text-gray-600 mb-1">
                  トップ賞
                </label>
                <input
                  type="number"
                  id="top_prize"
                  name="top_prize"
                  defaultValue={initialRules?.top_prize || groupRules.top_prize || 0}
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

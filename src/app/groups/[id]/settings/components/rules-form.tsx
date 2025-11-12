"use client";

import { useActionState } from "react";
import { updateGroupRules } from "@/app/actions/groups";
import { PrizeInputs } from "./prize-inputs";
import { UmaInputs } from "./uma-inputs";

// useActionState用のラッパー関数
async function updateGroupRulesAction(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  return await updateGroupRules(formData);
}

interface RulesFormProps {
  groupId: string;
  defaultValues: {
    gameType: string;
    startPoints: number;
    returnPoints: number;
    rate: number;
    umaFirst: number;
    umaSecond: number;
    tobiPrize: number;
    yakumanPrize: number;
    yakitoriPrize: number;
    topPrize: number;
  };
}

export function RulesForm({ groupId, defaultValues }: RulesFormProps) {
  const [state, formAction, isPending] = useActionState(updateGroupRulesAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="groupId" value={groupId} />

      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
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
              defaultChecked={defaultValues.gameType === "tonpuu"}
              className="mr-2"
              disabled={isPending}
            />
            東風戦
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gameType"
              value="tonnan"
              defaultChecked={defaultValues.gameType === "tonnan"}
              className="mr-2"
              disabled={isPending}
            />
            東南戦
          </label>
        </div>
      </div>

      {/* 開始点と返し点 */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="startPoints" className="block text-sm font-medium text-gray-700 mb-2">
            開始持ち点 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="startPoints"
            name="startPoints"
            required
            min="1000"
            step="1000"
            defaultValue={defaultValues.startPoints}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="returnPoints" className="block text-sm font-medium text-gray-700 mb-2">
            返し持ち点 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="returnPoints"
            name="returnPoints"
            required
            min="1000"
            step="1000"
            defaultValue={defaultValues.returnPoints}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
          />
        </div>
      </div>
      <p className="text-sm text-gray-500">
        オカなしなら返し持ち点を開始持ち点と同じ値にしてください
      </p>

      {/* レート */}
      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
          レート <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="rate"
          name="rate"
          required
          min="0.1"
          max="10"
          step="0.1"
          defaultValue={defaultValues.rate}
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition disabled:bg-gray-100"
        />
      </div>

      {/* ウマ */}
      <UmaInputs defaultFirst={defaultValues.umaFirst} defaultSecond={defaultValues.umaSecond} />

      {/* 各種賞金 */}
      <PrizeInputs
        defaultTobiPrize={defaultValues.tobiPrize}
        defaultYakumanPrize={defaultValues.yakumanPrize}
        defaultYakitoriPrize={defaultValues.yakitoriPrize}
        defaultTopPrize={defaultValues.topPrize}
      />

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}

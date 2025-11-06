"use client";

import { useState } from "react";

interface UmaInputsProps {
  defaultFirst: number;
  defaultSecond: number;
}

export function UmaInputs({ defaultFirst, defaultSecond }: UmaInputsProps) {
  const [umaFirst, setUmaFirst] = useState(defaultFirst);
  const [umaSecond, setUmaSecond] = useState(defaultSecond);

  return (
    <div>
      <div className="block text-sm font-medium text-gray-700 mb-2">
        ウマ（点棒） <span className="text-red-500">*</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        1000点単位で指定してください。1位と2位の設定で3位と4位が自動計算されます。
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="umaFirst" className="block text-xs text-gray-600 mb-1">
            1位
          </label>
          <div className="relative">
            <input
              type="number"
              id="umaFirst"
              name="umaFirst"
              required
              min="0"
              step="1000"
              value={umaFirst}
              onChange={(e) => setUmaFirst(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="umaSecond" className="block text-xs text-gray-600 mb-1">
            2位
          </label>
          <div className="relative">
            <input
              type="number"
              id="umaSecond"
              name="umaSecond"
              required
              min="0"
              step="1000"
              value={umaSecond}
              onChange={(e) => setUmaSecond(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-medium">自動計算：</span>
          3位 = -{umaSecond}点 / 4位 = -{umaFirst}点
        </p>
      </div>
      <input type="hidden" name="umaThird" value={-umaSecond} />
      <input type="hidden" name="umaFourth" value={-umaFirst} />
    </div>
  );
}

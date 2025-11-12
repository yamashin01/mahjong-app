"use client";

import { useState } from "react";

interface PrizeInputsProps {
  defaultTobiPrize: number;
  defaultYakumanPrize: number;
  defaultYakitoriPrize: number;
  defaultTopPrize: number;
}

export function PrizeInputs({
  defaultTobiPrize,
  defaultYakumanPrize,
  defaultYakitoriPrize,
  defaultTopPrize,
}: PrizeInputsProps) {
  const [tobiPrize, setTobiPrize] = useState(defaultTobiPrize);
  const [yakumanPrize, setYakumanPrize] = useState(defaultYakumanPrize);
  const [yakitoriPrize, setYakitoriPrize] = useState(defaultYakitoriPrize);
  const [topPrize, setTopPrize] = useState(defaultTopPrize);

  return (
    <div>
      <div className="block text-sm font-medium text-gray-700 mb-2">各種賞金（任意）</div>
      <p className="text-xs text-gray-500 mb-3">1000点単位で指定してください。</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-2 md:gap-4">
        <div>
          <label htmlFor="tobiPrize" className="block text-xs text-gray-600 mb-1">
            トビ賞
          </label>
          <div className="relative">
            <input
              type="number"
              id="tobiPrize"
              name="tobiPrize"
              min="0"
              step="1000"
              value={tobiPrize}
              onChange={(e) => setTobiPrize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="yakumanPrize" className="block text-xs text-gray-600 mb-1">
            役満賞
          </label>
          <div className="relative">
            <input
              type="number"
              id="yakumanPrize"
              name="yakumanPrize"
              min="0"
              step="1000"
              value={yakumanPrize}
              onChange={(e) => setYakumanPrize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="yakitoriPrize" className="block text-xs text-gray-600 mb-1">
            ヤキトリ賞
          </label>
          <div className="relative">
            <input
              type="number"
              id="yakitoriPrize"
              name="yakitoriPrize"
              min="0"
              step="1000"
              value={yakitoriPrize}
              onChange={(e) => setYakitoriPrize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="topPrize" className="block text-xs text-gray-600 mb-1">
            トップ賞
          </label>
          <div className="relative">
            <input
              type="number"
              id="topPrize"
              name="topPrize"
              min="0"
              step="1000"
              value={topPrize}
              onChange={(e) => setTopPrize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              点
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

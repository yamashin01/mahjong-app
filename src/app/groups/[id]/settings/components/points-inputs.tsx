"use client";

import { useEffect, useState } from "react";

interface PointsInputsProps {
  defaultReturnPoints: number;
  defaultOkaEnabled: boolean;
}

export function PointsInputs({
  defaultReturnPoints,
  defaultOkaEnabled,
}: PointsInputsProps) {
  const [returnPoints, setReturnPoints] = useState(defaultReturnPoints);
  const [okaEnabled, setOkaEnabled] = useState(defaultOkaEnabled);

  const handleReturnPointsChange = (value: number) => {
    setReturnPoints(value);
  };

  // 親フォームのokaEnabledチェックボックスの変更を監視
  useEffect(() => {
    const checkbox = document.querySelector('input[name="okaEnabled"]') as HTMLInputElement;
    if (checkbox) {
      const handleChange = () => {
        setOkaEnabled(checkbox.checked);
      };
      checkbox.addEventListener("change", handleChange);
      return () => checkbox.removeEventListener("change", handleChange);
    }
  }, []);

  return (
    <div>
      <label htmlFor="returnPoints" className="block text-sm font-medium text-gray-700 mb-2">
        返し点 <span className="text-red-500">*</span>
        {!okaEnabled && <span className="ml-2 text-xs text-gray-500">(オカ無効時は使用されません)</span>}
      </label>
      <input
        type="number"
        id="returnPoints"
        name="returnPoints"
        required={okaEnabled}
        min="1000"
        step="1000"
        value={returnPoints}
        onChange={(e) => handleReturnPointsChange(Number(e.target.value))}
        disabled={!okaEnabled}
        className={`w-full rounded-lg border px-4 py-3 focus:ring-2 outline-none transition ${
          !okaEnabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
      />
    </div>
  );
}

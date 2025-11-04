"use client";

import { useState } from "react";

interface PointsInputsProps {
  defaultStartPoints: number;
  defaultReturnPoints: number;
  defaultRate: number;
}

export function PointsInputs({
  defaultStartPoints,
  defaultReturnPoints,
  defaultRate,
}: PointsInputsProps) {
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
    <div className="sm:flex sm:justify-between sm:gap-4">
      <div className="mb-4">
        <label htmlFor="startPoints" className="block text-sm font-medium text-gray-700 mb-2">
          開始点 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="startPoints"
          name="startPoints"
          required
          min="1000"
          step="1000"
          value={startPoints}
          onChange={(e) => handleStartPointsChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>

      {/* 返し点 */}
      <div className="mb-4">
        <label htmlFor="returnPoints" className="block text-sm font-medium text-gray-700 mb-2">
          返し点 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="returnPoints"
          name="returnPoints"
          required
          min="1000"
          step="1000"
          value={returnPoints}
          onChange={(e) => handleReturnPointsChange(Number(e.target.value))}
          className={`w-full rounded-lg border px-4 py-3 focus:ring-2 outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

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
          step="0.1"
          defaultValue={defaultRate}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
      </div>
    </div>
  );
}

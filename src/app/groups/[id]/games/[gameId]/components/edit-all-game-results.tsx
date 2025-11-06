"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { updateGameResult } from "@/app/actions/games";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameResultData {
  id: string;
  playerName: string;
  seat: string;
  finalPoints: number;
}

interface EditAllGameResultsProps {
  gameId: string;
  groupId: string;
  results: GameResultData[];
  startPoints: number;
}

export function EditAllGameResults({
  gameId,
  groupId,
  results,
  startPoints,
}: EditAllGameResultsProps) {
  const [open, setOpen] = useState(false);
  const [finalPoints, setFinalPoints] = useState<Record<string, number>>(
    results.reduce(
      (acc, result) => ({
        ...acc,
        [result.id]: result.finalPoints,
      }),
      {},
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalPoints = Object.values(finalPoints).reduce((sum, points) => sum + points, 0);
  const expectedTotal = startPoints * 4;
  const isValidTotal = totalPoints === expectedTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 合計点のチェック
    if (!isValidTotal) {
      setError(
        `合計点が一致しません。4人の合計: ${totalPoints.toLocaleString()}点、必要な合計: ${expectedTotal.toLocaleString()}点`,
      );
      return;
    }

    // 変更があるかチェック
    const hasChanges = results.some((result) => finalPoints[result.id] !== result.finalPoints);
    if (!hasChanges) {
      setOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 各プレイヤーの結果を順次更新
    try {
      for (const result of results) {
        if (finalPoints[result.id] !== result.finalPoints) {
          const formData = new FormData();
          formData.append("resultId", result.id);
          formData.append("gameId", gameId);
          formData.append("groupId", groupId);
          formData.append("finalPoints", finalPoints[result.id].toString());

          const updateResult = await updateGameResult(formData);

          if (updateResult?.error) {
            throw new Error(updateResult.error);
          }
        }
      }

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFinalPoints(
      results.reduce(
        (acc, result) => ({
          ...acc,
          [result.id]: result.finalPoints,
        }),
        {},
      ),
    );
    setError(null);
    setOpen(false);
  };

  const updatePoints = (resultId: string, value: number) => {
    setFinalPoints((prev) => ({
      ...prev,
      [resultId]: value,
    }));
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="対局結果を一括編集"
        >
          <FiEdit2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>対局結果の編集</DialogTitle>
          <DialogDescription>
            4人の最終点を編集します。合計が{expectedTotal.toLocaleString()}
            点になる必要があります。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {results.map((result) => (
              <div key={result.id} className="space-y-2">
                <label
                  htmlFor={`points-${result.id}`}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <span className="text-gray-500">{result.seat}</span>
                  <span>{result.playerName}</span>
                </label>
                <input
                  id={`points-${result.id}`}
                  type="number"
                  min="-100000"
                  max="200000"
                  step="100"
                  value={finalPoints[result.id]}
                  onChange={(e) => updatePoints(result.id, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                  disabled={isLoading}
                  required
                />
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
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

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading || !isValidTotal}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

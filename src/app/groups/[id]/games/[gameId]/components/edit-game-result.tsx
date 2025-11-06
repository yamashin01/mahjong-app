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

interface EditGameResultProps {
  resultId: string;
  gameId: string;
  groupId: string;
  playerName: string;
  currentFinalPoints: number;
}

export function EditGameResult({
  resultId,
  gameId,
  groupId,
  playerName,
  currentFinalPoints,
}: EditGameResultProps) {
  const [open, setOpen] = useState(false);
  const [finalPoints, setFinalPoints] = useState(currentFinalPoints);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (finalPoints === currentFinalPoints) {
      setOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resultId", resultId);
    formData.append("gameId", gameId);
    formData.append("groupId", groupId);
    formData.append("finalPoints", finalPoints.toString());

    const result = await updateGameResult(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setFinalPoints(currentFinalPoints);
    setError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title={`${playerName}の最終点を編集`}
        >
          <FiEdit2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>最終点の編集</DialogTitle>
          <DialogDescription>
            {playerName}の最終点を変更します。順位とスコアは自動的に再計算されます。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="finalPoints" className="text-sm font-medium">
                最終点
              </label>
              <input
                id="finalPoints"
                type="number"
                min="-100000"
                max="200000"
                step="100"
                value={finalPoints}
                onChange={(e) => setFinalPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500">100点単位で入力してください</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

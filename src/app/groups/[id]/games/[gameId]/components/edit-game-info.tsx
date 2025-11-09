"use client";

import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { updateGameInfo } from "@/app/actions/games";
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

interface EditGameInfoProps {
  gameId: string;
  groupId: string;
  gameType: "tonpuu" | "tonnan";
  playedAt: string;
  yakumanCount: number;
}

export function EditGameInfo({
  gameId,
  groupId,
  gameType: initialGameType,
  playedAt: initialPlayedAt,
  yakumanCount: initialYakumanCount,
}: EditGameInfoProps) {
  const [open, setOpen] = useState(false);
  const [gameType, setGameType] = useState(initialGameType);
  const [playedAt, setPlayedAt] = useState(new Date(initialPlayedAt).toISOString().slice(0, 16));
  const [yakumanCount, setYakumanCount] = useState(initialYakumanCount);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("gameId", gameId);
    formData.append("groupId", groupId);
    formData.append("gameType", gameType);
    formData.append("playedAt", new Date(playedAt).toISOString());
    formData.append("yakumanCount", yakumanCount.toString());

    const result = await updateGameInfo(formData);

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setGameType(initialGameType);
    setPlayedAt(new Date(initialPlayedAt).toISOString().slice(0, 16));
    setYakumanCount(initialYakumanCount);
    setError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="対局情報を編集"
        >
          <FiEdit2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>対局情報の編集</DialogTitle>
          <DialogDescription>対局の情報を変更します。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="gameType" className="text-sm font-medium">
                対局種別
              </label>
              <select
                id="gameType"
                value={gameType}
                onChange={(e) => setGameType(e.target.value as "tonpuu" | "tonnan")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="tonpuu">東風戦</option>
                <option value="tonnan">東南戦</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="playedAt" className="text-sm font-medium">
                対局日時
              </label>
              <input
                id="playedAt"
                type="datetime-local"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
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

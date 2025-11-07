import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* パンくずリスト */}
        <div className="text-sm">
          <Skeleton className="h-5 w-64" />
        </div>

        {/* イベント情報 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          {/* モバイル: バッジと3点リーダー */}
          <div className="flex items-center justify-end gap-2 mb-2 md:hidden">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* デスクトップ: 横並びレイアウト */}
          <div className="hidden md:flex md:items-start md:justify-between mb-4">
            <div className="flex-1 flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* モバイル: イベント名 */}
          <div className="md:hidden mb-2">
            <Skeleton className="h-8 w-48" />
          </div>

          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-5 w-full" />
        </div>

        {/* イベント最終結果（完了時のみ表示される想定） */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-40 mb-4" />

          {/* モバイル: カード形式 */}
          <div className="md:hidden space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={`ranking-card-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mb-3 text-center py-2 bg-white rounded-md">
                  <Skeleton className="h-3 w-20 mb-1 mx-auto" />
                  <Skeleton className="h-8 w-24 mx-auto" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(2)].map((_, j) => (
                    <div
                      key={`stat-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                        j
                      }`}
                      className="bg-white rounded-md p-2 text-center"
                    >
                      <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                      <Skeleton className="h-5 w-8 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* デスクトップ: テーブル形式 */}
          <div className="hidden md:block">
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={`ranking-row-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                    i
                  }`}
                  className="h-16 w-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 対局記録 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-24 mb-4" />
          <Skeleton className="h-10 w-full rounded-lg mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={`game-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-8 mb-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ルール表示 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="w-full flex flex-col gap-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* グループページへのリンク */}
        <div className="text-center">
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>
    </main>
  );
}

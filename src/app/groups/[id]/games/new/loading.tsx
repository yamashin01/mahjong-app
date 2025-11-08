import { Skeleton } from "@/components/ui/skeleton";

export default function NewGameLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ヘッダー */}
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* 対局記録フォーム */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-6">
          {/* イベント選択 */}
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* 対局種別 */}
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>

          {/* 対局日時 */}
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* プレイヤー選択 (4人分) */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 mb-3" />
            {[...Array(4)].map((_, i) => (
              <div
                key={`player-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 特殊情報 */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-24 rounded-lg" />
          </div>
        </div>

        {/* グループページへのリンク */}
        <div className="text-center">
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>
    </main>
  );
}

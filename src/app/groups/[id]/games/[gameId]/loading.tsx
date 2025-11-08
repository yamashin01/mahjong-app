import { Skeleton } from "@/components/ui/skeleton";

export default function GameDetailLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ヘッダー */}
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* 対局情報 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={`info-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
              >
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* 対局結果 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>

          {/* モバイル: カード形式 */}
          <div className="md:hidden space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={`result-card-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={`detail-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                        j
                      }`}
                      className="text-center"
                    >
                      <Skeleton className="h-3 w-12 mb-1 mx-auto" />
                      <Skeleton className="h-6 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* デスクトップ: テーブル形式 */}
          <div className="hidden md:block">
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={`result-row-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                    i
                  }`}
                  className="h-20 w-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={`stat-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="text-center"
              >
                <Skeleton className="h-4 w-16 mb-2 mx-auto" />
                <Skeleton className="h-6 w-12 mx-auto" />
              </div>
            ))}
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

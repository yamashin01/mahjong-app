import { Skeleton } from "@/components/ui/skeleton";

export default function EventSettingsLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* パンくずリスト */}
        <div className="text-sm">
          <Skeleton className="h-5 w-80" />
        </div>

        {/* ヘッダー */}
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* ルール設定フォーム */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-6">
          <Skeleton className="h-7 w-40 mb-4" />

          {/* グループルール表示 */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <Skeleton className="h-5 w-48 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`group-rule-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                    i
                  }`}
                >
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* カスタムルール */}
          <div className="space-y-4">
            {/* 対局種別 */}
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>

            {/* ポイント設定 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`point-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                    i
                  }`}
                >
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>

            {/* ウマ設定 */}
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={`uma-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                      i
                    }`}
                  >
                    <Skeleton className="h-4 w-12 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* オカ設定 */}
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* 賞金設定 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`prize-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                    i
                  }`}
                >
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>

        {/* イベントページへのリンク */}
        <div className="text-center">
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>
    </main>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function GroupSettingsLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* ヘッダー */}
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* 設定フォーム */}
        <div className="space-y-6">
          {/* 対局種別 */}
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* ポイント設定 (2列) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
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

          {/* ボタン */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
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

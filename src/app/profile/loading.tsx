import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ヘッダー */}
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* プロフィール画像アップロード */}
        <div className="rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* プロフィール編集 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* 個人成績 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-7 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={`stat-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg bg-gray-50 p-4 text-center"
              >
                <Skeleton className="h-4 w-16 mb-2 mx-auto" />
                <Skeleton className="h-8 w-20 mx-auto" />
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={`rank-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="text-center"
              >
                <Skeleton className="h-3 w-8 mb-1 mx-auto" />
                <Skeleton className="h-2 w-full rounded-full mb-1" />
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* 参加グループ */}
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={`group-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-16 rounded-full mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* トップページへのリンク */}
        <div className="text-center">
          <Skeleton className="h-5 w-40 mx-auto" />
        </div>
      </div>
    </main>
  );
}

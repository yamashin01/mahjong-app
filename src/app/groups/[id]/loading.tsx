import { Skeleton } from "@/components/ui/skeleton";

export default function GroupDetailLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* ヘッダー部分 */}
        <div>
          {/* モバイル: 管理者バッジ */}
          <div className="flex justify-end mb-2 md:hidden">
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>

          {/* デスクトップ: 横並びレイアウト */}
          <div className="hidden md:flex md:items-start md:justify-between">
            <div className="flex-1">
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>

          {/* モバイル: グループ名と説明 */}
          <div className="md:hidden">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>

        {/* 招待コード */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-24 mb-3" />
          <div className="flex items-center gap-3">
            <Skeleton className="flex-1 h-14 rounded-lg" />
            <Skeleton className="h-14 w-14 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-80 mt-2" />
        </div>

        {/* メンバー一覧 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={`member-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50"
              >
                <div className="flex flex-col items-center text-center">
                  <Skeleton className="h-16 w-16 rounded-full mb-3" />
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* ゲストメンバー */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={`guest-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg border border-gray-200 p-4 bg-gray-50"
              >
                <div className="flex flex-col items-center text-center">
                  <Skeleton className="h-16 w-16 rounded-full mb-3" />
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* イベント */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={`event-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 対局記録 */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-24" />
          </div>
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
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 今日のランキング */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={`ranking-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* グループルール */}
        <div className="rounded-lg border border-gray-200 p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={`rule-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton static list
                  i
                }`}
              >
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-24" />
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

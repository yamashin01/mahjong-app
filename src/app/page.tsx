import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { MobileAddGroupMenu } from "@/app/components/mobile-add-group-menu";
import * as groupsRepo from "@/lib/supabase/repositories";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ユーザーが参加しているグループを取得
  const { data: memberships, error } = await groupsRepo.getUserGroups(user.id);

  if (error) {
    console.error("Error fetching groups:", error);
  }

  const groups = memberships?.map((m) => ({
    ...m.groups,
    role: m.role,
    joined_at: m.joined_at,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Image src="/images/top-image.jpg" alt="Top Background" width={1478} height={1108} className="w-full h-[80px] md:h-[200px] object-cover object-[10%_30%] mb-8" />

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 mb-2">参加しているグループ</h2>
              <div className="hidden md:flex gap-3 mb-2">
                <Link
                  href="/groups/new"
                  className="rounded-lg bg-lime-700 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600 transition-colors"
                >
                  新規作成
                </Link>
                <Link
                  href="/groups/join"
                  className="rounded-lg bg-lime-700 px-4 py-2 text-sm font-medium text-white hover:bg-lime-600 transition-colors"
                >
                  招待コードで参加
                </Link>
              </div>
              <MobileAddGroupMenu />
            </div>

            {groups && groups.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="block rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {group.name}
                        </h3>
                        {group.role === "admin" && (
                          <span className="inline-block rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                            管理者
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                      )}
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span>
                          招待コード:{" "}
                          <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {group.invite_code}
                          </code>
                        </span>
                        <span>
                          参加日: {new Date(group.joined_at).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      参加しているグループがありません
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      新しいグループを作成するか、招待コードで参加してください
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Link
                      href="/groups/new"
                      className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
                    >
                      新規グループ作成
                    </Link>
                    <Link
                      href="/groups/join"
                      className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
                    >
                      招待コードで参加
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
  );
}

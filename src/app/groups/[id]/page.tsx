import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "./copy-button";
import { MemberActions } from "./member-actions";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> } ) {

  const groupId: string = (await params).id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // グループ情報を取得
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // メンバーシップ確認
  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">アクセス権限がありません</h1>
          <p className="text-gray-600">このグループのメンバーではありません</p>
          <Link
            href="/groups"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            グループ一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  // メンバー一覧を取得
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
      user_id,
      role,
      joined_at,
      profiles (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });
  
  if (membersError) {
    console.error("Supabase Group Members Fetch Error:", membersError);
    // error.message を確認することで、RLS違反（'permission denied'など）が確認できることが多いです。
  }

  // グループルールを取得
  const { data: rules } = await supabase
    .from("group_rules")
    .select("*")
    .eq("group_id", groupId)
    .single();

  const isAdmin = membership.role === "admin";

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            {group.description && <p className="text-gray-600">{group.description}</p>}
          </div>
          {isAdmin && (
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800">
              管理者
            </span>
          )}
        </div>

        {/* 招待コード */}
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">招待コード</h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-2xl font-mono font-bold text-center">
              {group.invite_code}
            </code>
            <CopyButton code={group.invite_code} />
          </div>
          <p className="text-sm text-gray-600 mt-2">このコードを共有してメンバーを招待できます</p>
        </div>

        {/* メンバー一覧 */}
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">メンバー ({members?.length || 0})</h2>
          </div>
          <div className="space-y-3">
            {members?.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  {(member.profiles as any)?.avatar_url ? (
                    <img
                      src={(member.profiles as any).avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  )}
                  <div>
                    <p className="font-medium">
                      {(member.profiles as any)?.display_name || "名前未設定"}
                    </p>
                    <p className="text-sm text-gray-500">
                      参加日: {new Date(member.joined_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    {member.role === "admin" && (
                      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                        管理者
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <MemberActions
                      groupId={groupId}
                      userId={member.user_id}
                      currentRole={member.role as "admin" | "member"}
                      isCurrentUser={member.user_id === user.id}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* グループルール */}
        {rules && (
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">グループルール</h2>
              {isAdmin && (
                <Link
                  href={`/groups/${groupId}/settings`}
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  設定を変更
                </Link>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">対局種別</dt>
                <dd className="font-medium">
                  {rules.game_type === "tonpuu" ? "東風戦" : "東南戦"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">開始点</dt>
                <dd className="font-medium">{rules.start_points.toLocaleString()}点</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">返し点</dt>
                <dd className="font-medium">{rules.return_points.toLocaleString()}点</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">レート</dt>
                <dd className="font-medium">{rules.rate}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-gray-600">ウマ</dt>
                <dd className="font-medium">
                  {rules.uma_first}/{rules.uma_second}/{rules.uma_third}/{rules.uma_fourth}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="text-center">
          <Link href="/groups" className="text-blue-600 hover:text-blue-700 hover:underline">
            グループ一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

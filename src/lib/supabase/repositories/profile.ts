import { createClient } from "@/lib/supabase/server";

/**
 * プロフィールを更新する
 */
export async function updateProfile(params: {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const supabase = await createClient();
  return await supabase
    .from("profiles")
    .update({
      display_name: params.displayName,
      avatar_url: params.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId);
}

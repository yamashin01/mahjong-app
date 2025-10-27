import { redirect } from "next/navigation";

// トップページに参加グループ一覧が表示されるため、このページはトップページにリダイレクト
export default function GroupsPage() {
  redirect("/");
}

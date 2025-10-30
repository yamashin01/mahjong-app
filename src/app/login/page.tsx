import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "./google-sign-in-button";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="bg-[url('/images/login-bgImage.jpg')] bg-cover bg-no-repeat min-h-screen">
      <div className="flex min-h-screen items-center justify-center bg-white bg-opacity-60">
        <div className="w-full max-w-md space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">麻雀スコア管理アプリ</h1>
            <p className="mt-2 text-gray-800 text-xl">Googleアカウントでログインしてください</p>
          </div>

          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}

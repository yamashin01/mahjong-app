import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";

export const metadata: Metadata = {
  title: "麻雀スコア管理アプリ",
  description: "友人同士のカジュアルな麻雀および定期的な麻雀サークルにおけるスコア記録・管理アプリ",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

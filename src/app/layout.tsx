import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "麻雀スコア管理アプリ",
  description: "友人同士のカジュアルな麻雀および定期的な麻雀サークルにおけるスコア記録・管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

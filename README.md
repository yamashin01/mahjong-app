# 麻雀スコア管理アプリ

## 概要

このアプリケーションは、麻雀の半荘ごとのスコアを記録し、日次集計やランキング、長期的な成績管理を簡単に行うことができます。

### 主な機能
- Google アカウントでログイン
- グループ（サークル）の作成・管理
- 招待リンクによるメンバー追加
- カスタマイズ可能なルール設定（東風/東南、ウマオカ、レート、トビ賞、祝儀等）
- 半荘スコアの記録・編集・削除
- 日次集計・ランキング表示
- グループ通算成績の表示
- マルチデバイス対応（スマホ・タブレット・PC）
- PWA対応（ホーム画面に追加可能）

## 技術スタック

- フロントエンド: Next.js 15 (App Router) + React 19 + TypeScript
- スタイリング: Tailwind CSS + shadcn/ui
- バックエンド/DB: Supabase (PostgreSQL)
- 認証: Supabase Auth (Google OAuth)
- デプロイ: Vercel
- フォーム管理: React Hook Form + Zod

## ドキュメント

- [機能要件仕様書](./docs/functional-requirements.md) - 機能の詳細定義
- [技術アーキテクチャ設計](./docs/technical-architecture.md) - システム構成と技術選定
- [データベーススキーマ設計](./docs/database.md) - DB設計とRLSポリシー

## プロジェクト構成

```
mahjong-app/
├── docs/                        # 設計ドキュメント
├── claudedocs/                  # Claude専用ドキュメント
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # Reactコンポーネント
│   ├── lib/                     # ユーティリティ・ヘルパー
│   ├── types/                   # TypeScript型定義
│   ├── hooks/                   # カスタムフック
│   └── styles/                  # スタイル
├── public/                      # 静的ファイル
├── supabase/                    # Supabaseマイグレーション
└── README.md
```

## コントリビューション

プロジェクトの改善提案やバグ報告は Issues でお願いします。

## ライセンス

[合同会社benext](https://benext-corp.co.jp/)
# mahjong-app

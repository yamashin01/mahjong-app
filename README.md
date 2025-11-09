# 麻雀スコア管理アプリ

## 概要

このアプリケーションは、各グループでの麻雀の半荘ごとのスコアを記録し、イベント単位の集計やランキング、長期的な成績管理を簡単に行うことができます。

### 主な機能
- Google アカウントでログイン
- グループ（サークル）の作成・管理
- 招待リンクによるメンバー追加
- カスタマイズ可能なルール設定（東風/東南、ウマオカ、レート、トビ賞、祝儀等）
- グループ内のイベント作成・管理
- 半荘スコアの記録・編集・削除
- イベント集計・ランキング表示
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

### ユーザー向け
- [クイックスタートガイド](https://github.com/yamashin01/mahjong-app/wiki/%E3%82%AF%E3%82%A4%E3%83%83%E3%82%AF%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88%E3%82%AC%E3%82%A4%E3%83%89) - アプリの使い方（初めてのユーザー向け）

### 開発者向け
- [機能要件仕様書](./docs/functional-requirements.md) - 機能の詳細定義
- [技術アーキテクチャ設計](./docs/technical-architecture.md) - システム構成と技術選定
- [データベーススキーマ設計](./docs/database.md) - DB設計とRLSポリシー
- [機能設計書](./docs/specification.md) - 機能設計と画面遷移

## プロジェクト構成

```
mahjong-app/
├── docs/                        # 設計ドキュメント
├── claudedocs/                  # Claude専用ドキュメント
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # Reactコンポーネント
│   ├── lib/                     # ユーティリティ・ヘルパー
│   └── types/                   # TypeScript型定義
├── public/                      # 静的ファイル
├── supabase/                    # Supabaseマイグレーション
└── README.md
```

## コントリビューション

プロジェクトの改善提案やバグ報告は Issues でお願いします。

## ライセンス

[合同会社benext](https://benext-corp.co.jp/)

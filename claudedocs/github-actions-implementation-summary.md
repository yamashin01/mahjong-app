# GitHub Actions Implementation Summary

## 実装完了日
2025-10-27

## 概要
麻雀アプリにGitHub Actionsを使用した継続的インテグレーション(CI)ワークフローを実装しました。

## 実装内容

### 1. CIワークフロー (`.github/workflows/ci.yml`)

**トリガー条件**:
- Pull Request作成時
- mainブランチへのpush時

**実行ジョブ**:
1. **lint**: Biomeによるコード品質チェック
   - 実行コマンド: `pnpm lint`
   - チェック内容: コードスタイル、潜在的なバグ、ベストプラクティス違反

2. **type-check**: TypeScriptの型チェック
   - 実行コマンド: `pnpm type-check`
   - チェック内容: 型安全性、型エラーの検出

3. **build**: Next.jsビルド検証
   - 実行コマンド: `pnpm build`
   - チェック内容: ビルドエラー、ランタイムエラーの検出
   - 環境変数: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

**技術仕様**:
- Ubuntu latest環境で実行
- Node.js 20.x使用
- pnpm 9使用
- 依存関係キャッシング有効

### 2. PRバリデーションワークフロー (`.github/workflows/pr-validation.yml`)

**トリガー条件**:
- Pull Request: opened, synchronize, reopened

**実行ジョブ**:

#### validate-pr
- PRタイトルフォーマット検証
  - 必須プレフィックス: [Feature], [Bug], [Performance], [Refactor], [Docs]
- PR説明の長さ検証(最小50文字)
- 関連issue参照の確認

#### check-files
- 大容量ファイル検出(>1MB)
- デバッグコード検出(console.log等)
- TODOコメント検出

#### security-check
- シークレット情報の検出
- 機密ファイル(.env等)の検出

### 3. package.json スクリプト追加

```json
{
  "scripts": {
    "test": "pnpm type-check && pnpm build",
    "validate": "pnpm type-check",
    "validate:full": "pnpm lint && pnpm type-check"
  }
}
```

**用途**:
- `pnpm test`: CIと同じチェック実行(type-check + build)
- `pnpm validate`: 高速チェック(type-checkのみ、コーディング中)
- `pnpm validate:full`: 完全チェック(lint + type-check、コミット前)

### 4. セットアップガイド (`.github/GITHUB_ACTIONS_SETUP.md`)

**内容**:
- 環境変数設定手順(GitHub Secrets)
- ローカルテスト実行方法
- トラブルシューティングガイド
- ブランチ保護ルール推奨設定

## 設定が必要な項目

### GitHub Secrets
以下の環境変数をGitHub Secretsに設定する必要があります:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Supabaseプロジェクトの公開URL
   - Settings → Secrets and variables → Actions で設定

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabaseの匿名キー(公開キー)
   - Settings → Secrets and variables → Actions で設定

### ブランチ保護ルール(推奨)

mainブランチに以下の保護ルールを設定:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - lint
  - type-check
  - build
- ✅ Require branches to be up to date before merging

## コード修正

### src/app/groups/[id]/games/[gameId]/page.tsx
- 未使用変数警告の修正: `membership` → `_membership`
- 理由: 並列クエリでアクセス検証のみを実行、戻り値は使用しない

## 使用方法

### ローカルでのテスト
```bash
# CIと同じチェック(推奨: コミット前)
pnpm test

# 高速チェック(推奨: コーディング中)
pnpm validate

# 完全チェック(lint含む)
pnpm validate:full

# 個別実行
pnpm lint          # コード品質チェック
pnpm lint:fix      # 自動修正
pnpm type-check    # 型チェック
pnpm build         # ビルド検証
```

### Pull Request作成時
1. ブランチをpush
2. Pull Requestを作成
3. タイトルを正しいフォーマットで記入: `[Feature] ログイン機能の追加`
4. 自動的にCIとバリデーションが実行される
5. 全チェックがパスしたらマージ可能

## 期待される効果

### コード品質向上
- 自動コードレビューによる品質保証
- 型エラーの早期発見
- スタイル違反の統一的な検出

### 開発効率向上
- ビルドエラーの早期発見
- レビュー時間の削減
- マージ後のバグ減少

### セキュリティ強化
- 機密情報の誤コミット防止
- デバッグコードの検出
- セキュリティベストプラクティスの強制

## トラブルシューティング

### ビルドが失敗する場合
1. 環境変数がGitHub Secretsに設定されているか確認
2. ローカルで`pnpm test`を実行して同じエラーを再現
3. `pnpm install --frozen-lockfile`で依存関係を再インストール

### ワークフローが実行されない場合
1. `.github/workflows/*.yml`ファイルがmainブランチにマージされているか確認
2. GitHub Actions が有効になっているか確認(Settings → Actions)
3. ブランチ保護ルールが適切に設定されているか確認

## 今後の拡張候補

### テストフレームワーク追加
- Jest/Vitestの導入
- E2Eテスト(Playwright)の追加
- カバレッジレポートの生成

### デプロイメント自動化
- Vercelへの自動デプロイ
- プレビュー環境の自動作成
- ステージング環境デプロイ

### 追加チェック
- パフォーマンス回帰テスト
- アクセシビリティチェック
- SEOチェック
- バンドルサイズ監視

## 参考リンク
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Biome Documentation](https://biomejs.dev)
- [Next.js CI Setup](https://nextjs.org/docs/pages/building-your-application/deploying/ci-build-caching)

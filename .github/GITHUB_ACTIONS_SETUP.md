# GitHub Actions セットアップガイド

## 環境変数の設定

GitHub ActionsでビルドとCIを実行するには、以下の環境変数をGitHub Secretsに設定する必要があります。

### 必要なシークレット

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Supabaseプロジェクトの公開URL
   - 例: `https://xxxxxxxxxxxxx.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabaseの匿名キー(公開キー)
   - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 設定手順

1. GitHubリポジトリのページを開く
2. **Settings** → **Secrets and variables** → **Actions** に移動
3. **New repository secret** をクリック
4. 各シークレットを追加:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Secret: Supabase URLを入力
   - **Add secret** をクリック
   - 同様に `NEXT_PUBLIC_SUPABASE_ANON_KEY` も追加

### ワークフローの確認

設定完了後、以下のイベントでCIが自動実行されます:

- **Pull Request作成時**: lint、type-check、buildを実行
- **mainブランチへのpush時**: 同上

### ローカルでのテスト実行

```bash
# CIと同じチェック(type-check + build) - 推奨
pnpm test

# 高速チェック(type-checkのみ) - コーディング中
pnpm validate

# 完全チェック(lint + type-check) - コミット前
pnpm validate:full

# 個別実行
pnpm lint        # コード品質チェック
pnpm lint:fix    # 自動修正
pnpm type-check  # 型チェック
pnpm build       # ビルド検証
```

## ワークフローファイル

### メインワークフロー（役割別に分離）

1. **`.github/workflows/lint.yml`** - コード品質チェック
   - Biomeによるlint実行
   - フォーマットチェック
   - 警告のみ（PRブロックしない）

2. **`.github/workflows/type-check.yml`** - 型チェック
   - TypeScript型安全性の検証
   - 必須チェック（失敗時PRブロック）

3. **`.github/workflows/build.yml`** - ビルド検証
   - Next.js本番ビルド
   - Build artifactsの保存
   - 必須チェック（失敗時PRブロック）

4. **`.github/workflows/pr-validation.yml`** - コード品質検証
   - ファイルサイズチェック
   - デバッグコード検出
   - セキュリティチェック
   - 必須チェック（失敗時PRブロック）

### 利点
- **並列実行**: 各チェックが独立して実行されるため高速（~66%時間短縮）
- **役割明確化**: 各ワークフローが単一の責任を持つ
- **保守性向上**: 個別のワークフローを独立して修正可能
- **再実行の効率化**: 失敗したワークフローのみ再実行可能

## トラブルシューティング

### ビルドが失敗する場合

1. **環境変数が設定されているか確認**
   - GitHub Settings → Secrets and variables で確認

2. **ローカルで同じエラーが再現するか確認**
   ```bash
   pnpm test
   ```

3. **依存関係の問題**
   - `pnpm install --frozen-lockfile` で依存関係を再インストール

### ワークフローが実行されない場合

1. `.github/workflows/*.yml` ファイルがmainブランチにマージされているか確認
2. GitHub Actions が有効になっているか確認(Settings → Actions)
3. ブランチ保護ルールが適切に設定されているか確認

### 個別ワークフローの再実行

1. GitHub の Actions タブを開く
2. 失敗したワークフローを選択
3. "Re-run failed jobs" をクリック
4. 個別のジョブのみ再実行可能（全体の再実行不要）

## 推奨設定

### ブランチ保護ルール

mainブランチに以下の保護ルールを設定することを推奨:

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. 有効化する項目:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - **必須**: `Type Check / TypeScript Type Validation`
     - **必須**: `Build / Next.js Production Build`
     - **必須**: `Code Quality Validation / Check Modified Files`
     - **必須**: `Code Quality Validation / Security Check`
     - **オプション**: `Lint / Code Quality Check` (警告のみ)
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history (推奨)

これにより、型チェック、ビルド、コード品質がパスしない限りmainブランチへのマージができなくなります。
Lintは警告のみなので、失敗してもマージは可能です。

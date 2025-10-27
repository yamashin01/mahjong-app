# GitHub Actions ワークフローアーキテクチャ

## 📐 設計原則

### 役割別分離 (Separation of Concerns)
各ワークフローは単一の責任を持ち、独立して実行可能な構成になっています。

### 再利用性 (Reusability)
共通のセットアップ処理を再利用可能なワークフローとして定義しています。

### 並列実行 (Parallelization)
各チェックは独立して並列実行されるため、全体の実行時間が短縮されます。

### 明確なフィードバック (Clear Feedback)
各ワークフローはGitHub Summaryを使用して、結果を明確に表示します。

## 🏗️ ワークフロー構成

### 1. Lint Workflow (`lint.yml`)
**目的**: コード品質チェック

**トリガー**:
- `push` to main/develop
- `pull_request` to main/develop
- `workflow_dispatch` (手動実行)

**実行内容**:
- Biome lint実行
- Biome format check
- 警告のみ（PRブロックしない）

**特徴**:
- `continue-on-error: true` で警告を許容
- GitHub Summary でlint結果を表示
- コード品質の可視化が目的

### 2. Type Check Workflow (`type-check.yml`)
**目的**: TypeScript型安全性の検証

**トリガー**:
- `push` to main/develop
- `pull_request` to main/develop
- `workflow_dispatch`

**実行内容**:
- TypeScript `tsc --noEmit` による型チェック

**特徴**:
- 型エラーがあればPRブロック（必須チェック）
- 成功/失敗時に異なるSummaryを表示
- 型安全性の保証

### 3. Build Workflow (`build.yml`)
**目的**: Next.js本番ビルドの検証

**トリガー**:
- `push` to main/develop
- `pull_request` to main/develop
- `workflow_dispatch`

**実行内容**:
- Next.js production build
- Build artifacts のアップロード

**特徴**:
- 環境変数（Supabase credentials）を使用
- ビルド成果物を7日間保持
- ビルドエラーがあればPRブロック（必須チェック）

### 4. Code Quality Validation Workflow (`quality-check.yml`)
**目的**: コード変更の品質とセキュリティの検証

**トリガー**:
- `pull_request`: opened, synchronize, reopened

**実行ジョブ**:

#### check-files
- 大容量ファイル検出（>1MB）
- デバッグコード検出（console.log等）
- TODOコメント検出

#### security-check
- シークレット情報の検出
- 機密ファイル（.env等）の検出

### 5. Setup Workflow (`_setup.yml`) - 未使用
**目的**: 共通セットアップの再利用可能ワークフロー

**注意**: 現在は各ワークフローで直接セットアップを定義していますが、将来的にこのワークフローを使用することで重複を削減できます。

## 🔄 実行フロー

### Pull Request作成時

```mermaid
PR作成
  ├─→ Lint (並列実行) ⚠️  警告のみ
  ├─→ Type Check (並列実行) ✅ 必須
  ├─→ Build (並列実行) ✅ 必須
  └─→ Code Quality Validation (並列実行) ✅ 必須
       ├─→ check-files
       └─→ security-check
```

### Main/Developブランチへのpush時

```
Push
  ├─→ Lint (並列実行)
  ├─→ Type Check (並列実行)
  └─→ Build (並列実行)
```

## ⚙️ 必須チェックと推奨設定

### ブランチ保護ルール

**必須ステータスチェック**:
- `Type Check / TypeScript Type Validation` ✅ 必須
- `Build / Next.js Production Build` ✅ 必須
- `Code Quality Validation / Check Modified Files` ✅ 必須
- `Code Quality Validation / Security Check` ✅ 必須

**オプション**:
- `Lint / Code Quality Check` ⚠️ 警告のみ

### GitHub Secrets設定

**必須**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 実行時間の最適化

### 並列実行による高速化
各ワークフローは独立して並列実行されるため:
- **単一ワークフロー**: 合計 ~60秒（lint→type-check→build）
- **分割ワークフロー**: 最大 ~20秒（最も遅いworkflow）

**高速化率**: 約66%の時間短縮

### キャッシュ戦略
- pnpmキャッシュ: `actions/setup-node@v4` のcache機能
- 依存関係: `pnpm install --frozen-lockfile` で高速化

## 🔧 ローカル開発との対応

### ローカルコマンド vs CIワークフロー

| ローカルコマンド | 対応ワークフロー | 実行時間 |
|----------------|----------------|---------|
| `pnpm lint` | `lint.yml` | ~5秒 |
| `pnpm type-check` | `type-check.yml` | ~5秒 |
| `pnpm build` | `build.yml` | ~20秒 |
| `pnpm validate` | type-check.yml | ~5秒 |
| `pnpm test` | type-check.yml + build.yml | ~25秒 |
| `pnpm validate:full` | lint.yml + type-check.yml | ~10秒 |

## 🎯 使用ガイド

### 開発ワークフロー

**1. 機能開発中**
```bash
# 高速チェック
pnpm validate
```

**2. コミット前**
```bash
# CIと同じチェック
pnpm test
```

**3. PR作成前**
```bash
# 完全チェック
pnpm validate:full
pnpm test
```

### PR作成

1. ブランチをpush
2. PR作成（タイトル: `[Feature] 機能名`）
3. 自動的に4つのワークフローが並列実行
4. 全必須チェックがパスすればマージ可能

### トラブルシューティング

#### Lint失敗（警告のみ）
- PRマージはブロックされない
- 可能であれば修正を推奨
- `pnpm lint:fix` で自動修正

#### Type Check失敗
- **PRマージがブロックされる**
- ローカルで `pnpm type-check` を実行
- 型エラーを修正してからpush

#### Build失敗
- **PRマージがブロックされる**
- ローカルで `pnpm build` を実行
- ビルドエラーを修正してからpush
- 環境変数（Supabase）を確認

#### Code Quality Validation失敗
- **PRマージがブロックされる**
- 大容量ファイル（>1MB）を確認
- デバッグコード（console.log等）を削除
- シークレット情報が含まれていないか確認

## 🚀 今後の拡張

### Phase 2: テストワークフロー
```yaml
# test.yml
- Unit tests (Jest/Vitest)
- E2E tests (Playwright)
- Coverage reports
```

### Phase 3: デプロイワークフロー
```yaml
# deploy.yml
- Vercel deployment
- Preview environment
- Staging deployment
```

### Phase 4: パフォーマンスモニタリング
```yaml
# performance.yml
- Lighthouse CI
- Bundle size tracking
- Performance regression tests
```

## 📚 参考資料

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

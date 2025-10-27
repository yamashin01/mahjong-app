# GitHub Actions Lint ポリシー

## 現在の設定

### Lint の扱い

CIワークフローでは、lintは実行されますが **失敗してもビルド全体は失敗しません**。

```yaml
- name: Run lint
  run: pnpm lint
  continue-on-error: true
```

### 理由

現在のコードベースには以下のlint警告/エラーが残っています:

1. **`as any` の使用** (12箇所)
   - Server Actionsの型キャスト
   - Supabaseクエリ結果の型変換
   - 既に `biome.json` で警告レベルに設定済み

2. **アクセシビリティ警告**
   - ラベルとinputの関連付け
   - ボタンの type 属性（一部修正済み）

3. **CSS構文**
   - Tailwind CSS の `@apply` ディレクティブ

### 修正済みの項目

✅ **middleware.ts** - forEach の戻り値問題を修正
✅ **未使用インポート** - 自動修正で削除
✅ **ボタンのtype属性** - guest-player コンポーネントで修正
✅ **未使用変数** - `_membership` に変更

### 推奨される対応

#### 優先度 高
- [ ] Server Actions の適切な型定義を作成
- [ ] Supabase クエリ結果の型を `supabase-queries.ts` に追加

#### 優先度 中
- [ ] アクセシビリティ警告の修正
  - label要素に `htmlFor` 属性を追加
  - ラジオボタングループの適切なマークアップ

#### 優先度 低
- [ ] Tailwind CSS 警告の対応
  - `biome.json` でCSS構文エラーを無視するよう設定

## ローカル開発での推奨ワークフロー

### コーディング中
```bash
# 高速チェック（型チェックのみ）
pnpm validate
```

### コミット前
```bash
# CIと同じチェック（type-check + build）
pnpm test

# 完全チェック（lint + type-check）
pnpm validate:full
```

### Lint のみ確認
```bash
# Lint実行（エラーと警告を確認）
pnpm lint

# Lint自動修正
pnpm lint:fix
```

### 個別チェック
```bash
pnpm lint          # コード品質チェック（警告含む）
pnpm type-check    # 型チェック（必須）
pnpm build         # ビルド検証（必須）
```

## CI/CD での動作

### Pull Request時
1. **lint**: 実行される（警告表示のみ、失敗しない）
2. **type-check**: 実行される（失敗するとマージ不可）
3. **build**: 実行される（失敗するとマージ不可）

### ブランチ保護ルール
以下のステータスチェックを必須にすることを推奨:
- ✅ `type-check` - 必須
- ✅ `build` - 必須
- ⚠️ `lint` - オプション（警告表示のみ）

## 型安全性の向上計画

将来的に `as any` を減らすための戦略:

### 1. Server Actions の型定義
```typescript
// types/actions.ts
export type ServerActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type FormServerAction<T = void> = (
  formData: FormData
) => Promise<ServerActionResult<T>>;
```

### 2. Supabase クエリ結果の厳密な型
```typescript
// types/supabase-queries.ts
export type GroupMemberWithProfile = {
  user_id: string;
  role: "admin" | "member";
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};
```

### 3. ユーティリティ関数の型改善
```typescript
// lib/utils/player.ts
export function getPlayerDisplayName(
  player: GroupMemberWithProfile | GameResultWithPlayer | null
): string {
  // 型安全な実装
}
```

## 参考リンク
- [Biome Lint Rules](https://biomejs.dev/linter/rules/)
- [Next.js TypeScript](https://nextjs.org/docs/pages/building-your-application/configuring/typescript)
- [React Server Actions](https://react.dev/reference/react/use-server)

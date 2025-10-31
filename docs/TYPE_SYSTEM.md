# Type System Documentation

## 概要

このプロジェクトは、Supabaseの`database.types.ts`を**Single Source of Truth**とする統一型システムを採用しています。

## 型システムの構造

```
src/types/
├── database.types.ts  # 🔷 Source of Truth (Supabase自動生成)
├── index.ts          # 🔷 Central Export Hub (型の整理・エクスポート)
└── event-rules.ts    # 🔷 Domain-specific types (database.types.tsベース)
```

### 型の階層

```typescript
// 1. BASE TYPES - Database Table Types
export type GameRow = Database['public']['Tables']['games']['Row'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];

// 2. QUERY TYPES - Types with Relations
export type GameWithResults = GameRow & {
  game_results: Array<GameResultRow>;
};

// 3. DOMAIN TYPES - Application-Specific Business Logic
export type RankingData = {
  player_id: string | null;
  display_name: string | null;
  // ... 集計結果
};
```

## npm/pnpm スクリプト

### `pnpm db:types`
ローカルのSupabaseインスタンスから型定義を生成します。

```bash
pnpm db:types
```

**使用タイミング**:
- マイグレーションを作成・適用した後
- ローカル開発中にスキーマを変更した後

**前提条件**:
- Docker Desktopが起動していること
- `supabase start`でローカルSupabaseが起動していること

### `pnpm db:types:remote`
本番環境のSupabaseプロジェクトから型定義を生成します。

```bash
# 環境変数を設定して実行
SUPABASE_PROJECT_ID=your-project-id pnpm db:types:remote

# または.envに設定して実行
pnpm db:types:remote
```

**使用タイミング**:
- 本番環境のスキーマと同期したい時
- チーム開発でリモートの最新スキーマを取得する時

**前提条件**:
- Supabase CLIがログイン済み (`supabase login`)
- プロジェクトIDが設定されていること

### `pnpm db:sync`
型定義を生成した後、TypeScriptの型チェックを実行します。

```bash
pnpm db:sync
```

**使用タイミング**:
- マイグレーション後に型の整合性を確認したい時
- 型エラーを即座に検出したい時

**動作**:
1. `pnpm db:types` を実行（ローカルから型生成）
2. `pnpm type-check` を実行（型エラーチェック）

## ワークフロー

### 1. 新しいマイグレーション作成時

```bash
# 1. マイグレーションファイル作成
npx supabase migration new add_new_field

# 2. マイグレーションを編集
# supabase/migrations/XXX_add_new_field.sql

# 3. ローカルに適用
npx supabase db reset

# 4. 型定義を更新 & 型チェック
pnpm db:sync

# 5. 型エラーがあれば修正
# TypeScriptコンパイラが正確な箇所を指摘

# 6. コミット
git add .
git commit -m "Add new field to table"
```

### 2. リモートスキーマと同期

```bash
# 1. リモートから最新の型定義を取得
SUPABASE_PROJECT_ID=your-project-id pnpm db:types:remote

# 2. 型チェック
pnpm type-check

# 3. 必要に応じてコードを更新
```

### 3. 新しいテーブル追加時

```bash
# 1. マイグレーション作成 & 適用
npx supabase migration new create_new_table
npx supabase db reset

# 2. 型定義を更新
pnpm db:types

# 3. src/types/index.ts に型をエクスポート追加
```

**src/types/index.ts への追加例**:
```typescript
// Base types
export type NewTableRow = Database['public']['Tables']['new_table']['Row'];
export type NewTableInsert = Database['public']['Tables']['new_table']['Insert'];
export type NewTableUpdate = Database['public']['Tables']['new_table']['Update'];
```

## 型の使用パターン

### Repository Layer

```typescript
import type { GameInsert, GameUpdate, GameRow } from "@/types";

// ✅ Create operations
export async function createGame(gameData: GameInsert) {
  const supabase = await createClient();
  return await supabase.from("games").insert(gameData).select().single();
}

// ✅ Update operations
export async function updateGame(id: string, data: GameUpdate) {
  const supabase = await createClient();
  return await supabase.from("games").update(data).eq("id", id);
}

// ✅ Read operations
export async function getGame(id: string): Promise<GameRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("games").select("*").eq("id", id).single();
  return data;
}
```

### Action Layer

```typescript
import type { GameInsert } from "@/types";
import * as gamesRepo from "@/lib/supabase/repositories/games";

export async function createGameAction(formData: FormData) {
  const gameData: GameInsert = {
    group_id: formData.get("groupId") as string,
    game_type: formData.get("gameType") as string,
    // ✅ Use database column names
  };

  const { data, error } = await gamesRepo.createGame(gameData);
  // ...
}
```

## ベストプラクティス

### ✅ DO

1. **常に`@/types`からインポート**
   ```typescript
   import type { GameRow, GameInsert } from "@/types";
   ```

2. **DBカラム名を使用**
   ```typescript
   const data: GameInsert = {
     group_id: groupId,    // ✅ DB column name
     game_type: gameType,  // ✅ DB column name
   };
   ```

3. **Insert型でcreate関数を定義**
   ```typescript
   export async function createGame(gameData: GameInsert) { ... }
   ```

4. **Update型でupdate関数を定義**
   ```typescript
   export async function updateGame(id: string, data: GameUpdate) { ... }
   ```

5. **マイグレーション後は必ず型同期**
   ```bash
   pnpm db:sync
   ```

### ❌ DON'T

1. **手動で型定義を作成しない**
   ```typescript
   // ❌ BAD: Manual type definition
   type Game = {
     id: string;
     group_id: string;
     // ...
   };
   ```

2. **camelCaseとsnake_caseを混在させない**
   ```typescript
   // ❌ BAD: Inconsistent naming
   const data = {
     groupId: id,        // camelCase
     game_type: type,    // snake_case
   };
   ```

3. **database.types.tsを直接編集しない**
   ```typescript
   // ❌ BAD: Manual edit to generated file
   // This file will be overwritten by `pnpm db:types`
   ```

## トラブルシューティング

### 型エラー: "Property does not exist"

**原因**: `database.types.ts`が古い

**解決方法**:
```bash
pnpm db:types
pnpm type-check
```

### 型エラー: "Type is not assignable"

**原因**: Repository関数のシグネチャとAction層の呼び出しが不一致

**解決方法**:
1. Repository関数がInsert/Update型を使っているか確認
2. Action層がDBカラム名を使っているか確認

```typescript
// ✅ Repository
export async function createGame(gameData: GameInsert) { ... }

// ✅ Action (DBカラム名を使用)
await createGame({
  group_id: groupId,
  game_type: gameType,
});
```

### "supabase command not found"

**原因**: Supabase CLIがインストールされていない

**解決方法**:
```bash
npm install -g supabase
```

### Docker not running

**原因**: ローカルSupabaseの起動にはDockerが必要

**解決方法**:
1. Docker Desktopを起動
2. `supabase start`を実行
3. `pnpm db:types`を実行

## CI/CD統合

### GitHub Actions例

```yaml
name: Type Check

on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Setup Supabase CLI
        run: npm install -g supabase

      - name: Start Supabase
        run: supabase start

      - name: Generate types
        run: pnpm db:types

      - name: Type check
        run: pnpm type-check
```

## まとめ

この型システムは以下を保証します：

✅ **型安全性**: DBスキーマとコードの完全同期
✅ **保守性**: 変更箇所の最小化、自動エラー検出
✅ **開発体験**: 完璧なIDE補完、即座の型チェック
✅ **一貫性**: すべてのコードが統一された型を使用

**重要**: マイグレーション作成後は必ず`pnpm db:sync`を実行してください！

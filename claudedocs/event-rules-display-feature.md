# イベントルール表示機能の実装

## 概要

イベント詳細ページに、そのイベントで適用されるルールを表示する機能を実装しました。対局記録欄の下に配置され、カスタムルールとグループデフォルトルールを自動的に判別して表示します。

## 実装内容

### 新規コンポーネント: EventRulesDisplay

**ファイル**: `src/components/event-rules-display.tsx`

#### 機能
- イベントのカスタムルールを表示
- カスタムルールがない場合はグループのデフォルトルールを表示
- ルールの種類をバッジで明示
- 見やすいグリッドレイアウトで情報を整理

#### 表示内容

**基本設定**:
- 対局種別（東風戦/東南戦）
- 開始持ち点
- 返し持ち点
- オカの有無

**ウマ・レート**:
- ウマ（1位/2位/3位/4位）
- レート

**賞金設定**（設定されている場合のみ）:
- トビ賞
- 役満賞
- トップ賞

#### バッジ表示

- **グループデフォルト**: グレーのバッジ
  - イベントにカスタムルールが設定されていない場合

- **イベント専用ルール**: 青いバッジ
  - イベントにカスタムルールが設定されている場合

### イベント詳細ページの更新

**ファイル**: `src/app/groups/[id]/events/[eventId]/page.tsx`

#### 変更点

1. **グループルールの取得**
   ```typescript
   const [eventResult, groupResult, rulesResult] = await Promise.all([
     supabase.from("events" as any).select("*").eq("id", eventId).single() as any,
     supabase.from("groups").select("name").eq("id", groupId).single(),
     supabase.from("group_rules").select("*").eq("group_id", groupId).single(),
   ]);
   ```

2. **イベントルールの抽出**
   ```typescript
   const eventRules: EventRules = {
     game_type: event.game_type,
     start_points: event.start_points,
     // ... その他のルール項目
   };
   ```

3. **コンポーネントの配置**
   - 対局記録セクションの直後に配置
   - 管理者用操作セクションの前に配置

## UI/UXの特徴

### レイアウト
- 2カラムグリッドレイアウトで情報を整理
- 左列: 基本設定
- 右列: ウマ・レート
- 賞金設定は全幅で表示（設定時のみ）

### 視覚的な明確さ
- セクションごとに下線で区切り
- 項目名はグレー、値は太字で強調
- バッジでルールの種類を一目で識別可能

### レスポンシブ対応
- グリッドレイアウトで画面サイズに適応
- 小さい画面でも読みやすい

## コード例

### コンポーネントの使用方法

```tsx
<EventRulesDisplay
  eventRules={eventRules}
  groupRules={groupRules}
/>
```

### Props

```typescript
interface EventRulesDisplayProps {
  eventRules: EventRules;
  groupRules: {
    game_type: string;
    start_points: number;
    return_points: number;
    uma_first: number;
    uma_second: number;
    uma_third: number;
    uma_fourth: number;
    oka_enabled: boolean;
    rate: number;
    tobi_prize: number | null;
    yakuman_prize: number | null;
    top_prize: number | null;
  };
}
```

## 表示ロジック

### ルール決定の優先順位

```typescript
const displayRules = {
  game_type: eventRules.game_type ?? groupRules.game_type,
  start_points: eventRules.start_points ?? groupRules.start_points,
  // ... 各項目で同様の処理
};
```

1. イベントルールが設定されている（NULL以外）場合: イベントルールを使用
2. イベントルールがNULLの場合: グループルールを使用

### カスタムルール判定

```typescript
const hasCustomRules = eventRules.game_type !== undefined && eventRules.game_type !== null;
```

`game_type`が設定されているかどうかで、カスタムルールの有無を判定します。

## スタイリング

### Tailwind CSSクラス

- **コンテナ**: `rounded-lg border border-gray-200 p-6 bg-white`
- **グリッド**: `grid grid-cols-2 gap-6`
- **バッジ**:
  - デフォルト: `text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded`
  - カスタム: `text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded`

## テストシナリオ

### 1. グループデフォルトルールの表示
- イベントにカスタムルールが設定されていない場合
- 「グループデフォルト」バッジが表示される
- グループのルール設定が表示される

### 2. イベント専用ルールの表示
- イベントにカスタムルールが設定されている場合
- 「イベント専用ルール」バッジが表示される
- イベント固有のルール設定が表示される

### 3. 部分的なカスタムルール
- 一部の項目だけカスタムルールが設定されている場合
- カスタム項目はイベントルール、未設定項目はグループルールが表示される

### 4. 賞金設定の条件表示
- 全ての賞金が0の場合: 賞金セクションは非表示
- 一つでも賞金が設定されている場合: 賞金セクションが表示される

## 今後の拡張可能性

1. **ルール変更履歴**: ルール設定の変更履歴を表示
2. **ルール比較モード**: グループルールとの差分を強調表示
3. **印刷対応**: 大会要項として印刷しやすいフォーマット
4. **エクスポート**: ルール設定をJSON/PDFでエクスポート

## 関連ファイル

- コンポーネント: `src/components/event-rules-display.tsx`
- イベント詳細: `src/app/groups/[id]/events/[eventId]/page.tsx`
- 型定義: `src/types/event-rules.ts`
- 実装ドキュメント: `claudedocs/event-rules-implementation.md`

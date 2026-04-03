# パーソナルサポートアプリ 仕様書

> Claude Codeへの引き継ぎドキュメント  
> 作成日: 2026-04-04

---

## 概要

自分専用のスマホ向けタスク・スケジュール管理アプリ。  
Google Tasks / Google Calendar と連携し、AIによるタスク分割機能を持つPWA。

- **配布なし・個人利用のみ**
- **スマホのホーム画面に追加して使う（PWA）**
- **既存の「AI秘書ちゃん」（LINE Bot）とGoogle Tasks/Calendarを通じてデータ共有**

---

## 技術スタック

| 項目 | 採用技術 | 備考 |
|------|---------|------|
| フロントエンド | React + TypeScript | Vite でビルド |
| PWA | Vite PWA Plugin (Workbox) | ホーム画面追加対応 |
| ホスティング | GitHub Pages | 無料・HTTPS対応 |
| 認証 | Google OAuth 2.0 | Cloud Console設定済み前提 |
| タスク | Google Tasks API | サブタスク含む |
| スケジュール | Google Calendar API | 読み取りのみ |
| 定期タスク | Google Sheets API | 繰り返しルール管理用 |
| メモ | Google Sheets API | フリーテキスト保存 |
| AI分割 | Anthropic Claude API | ボタン押下時のみ呼び出し |
| APIキー管理 | Google Apps Script をプロキシとして使用 | フロントにキーを露出しない |

---

## 画面構成（4画面・ボトムナビ）

```
ボトムナビ: ホーム / タスク / カレンダー / メモ
```

### 1. ホーム画面

- 今日の日付・挨拶
- 今日のスケジュール（Google Calendarから、読み取り専用）
- 今日やること（Google Tasksの当日期限タスク）
- 直近のタスク（3件程度）

### 2. タスク画面（メイン）

3つのセクションで構成（同一画面でスクロール）：

#### ① 今日やること
- Google Tasks から `due = 今日` のタスクを表示
- チェックで完了
- 各タスクに「✦ AI分割」ボタン

#### ② カテゴリ別やること
- カテゴリ: `仕事 / プライベート / 健康 / 家事`
- カテゴリはAIが自動分類（タスク登録時）、手動変更も可
- カテゴリの保存方法: **Google Tasksのメモ欄に `#カテゴリ名` を埋め込む**
  - 例: `#仕事 #重要`
- **ドラッグ&ドロップでカテゴリ変更**
  - タスクカード左端のグリップ（⠿）をつかんでドラッグ
  - カテゴリゾーンの上でハイライト → 離すと移動
  - Google Tasks のメモ欄のカテゴリタグを書き換えて保存
- 各タスクに「✦ AI分割」ボタン
- アコーディオン開閉（カテゴリヘッダーをタップ）

#### ③ 今日の予定（カレンダーから）
- Google Calendar の当日予定を一覧表示
- 各予定に「✦ AI分割」ボタン（予定名 → タスク群に変換）

### 3. カレンダー画面

- 週間ビュー（横スクロールで日付選択）
- タイムライン表示（Google Calendarの予定）
- タスクの期限日をタイムライン上に重ねて表示

### 4. メモ画面

- メモ一覧（タップで展開）
- 新規作成ボタン（+）
- カテゴリタグ付き
- 保存先: Google Sheets

---

## AI分割機能

### トリガー
- タスク画面①②③それぞれの「✦ AI分割」ボタン押下時のみ

### フロー
1. ボタン押下 → AI分割モーダルが開く
2. 「AIで分割する」ボタンを押す
3. Claude API を呼び出し（GASプロキシ経由）
4. サブタスク候補を一覧表示
5. ユーザーがチェックで取捨選択
6. 「Google Tasksに保存」ボタンで確定
   - タスク由来 → Google Tasks のサブタスクとして保存
   - カレンダー予定由来 → 新規タスクとして保存（カテゴリ自動付与）

### Claude APIへのプロンプト（GASプロキシ側で実装）
```
以下のタスクまたは予定を、具体的なアクションに分解してください。
5件以内で、それぞれ1行・動詞から始まる形式で出力してください。
JSON配列で返してください: ["タスク1", "タスク2", ...]

対象: {title}
```

---

## 定期タスク機能

Google Tasks APIに繰り返し機能がないため、Google Sheetsで管理。

### Sheetsのスキーマ（シート名: `recurring_tasks`）

| 列 | 内容 | 例 |
|----|------|----|
| A | タスク名 | 請求書確認 |
| B | カテゴリ | 仕事 |
| C | 間隔（日数） | 30 |
| D | 最終実行日 | 2026/03/01 |
| E | 次回予定日 | 2026/04/01 |
| F | 有効フラグ | TRUE |

### 動作
- アプリ起動時に次回予定日を確認
- 当日以前の定期タスクがあれば自動でGoogle Tasksに追加
- 追加後に最終実行日・次回予定日を更新

---

## カテゴリ管理仕様

### 保存形式
Google Tasks のメモ欄（notes フィールド）に埋め込む：

```
#仕事 #重要
本来のメモ内容があればここに続ける
```

### パース方法
```typescript
// メモ欄からカテゴリとタグを抽出
const parseNotes = (notes: string) => {
  const tags = (notes.match(/#[\w\u3040-\u9FFF]+/g) || []).map(t => t.slice(1));
  const category = CATEGORIES.find(c => tags.includes(c)) || "未分類";
  const body = notes.replace(/#[\w\u3040-\u9FFF]+/g, "").trim();
  return { category, tags, body };
};
```

### カテゴリ一覧
```typescript
const CATEGORIES = ["仕事", "プライベート", "健康", "家事"] as const;
```

---

## Google API スコープ

OAuth 同意画面に必要なスコープ：

```
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/spreadsheets
```

---

## ディレクトリ構成（推奨）

```
project-root/
├── public/
│   ├── manifest.json       # PWA設定
│   └── icons/              # アイコン各サイズ
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   └── BottomNav.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── CategoryZone.tsx   # ドロップゾーン
│   │   │   ├── AIModal.tsx        # AI分割モーダル
│   │   │   └── DraggableTask.tsx
│   │   ├── calendar/
│   │   │   ├── WeekStrip.tsx
│   │   │   └── Timeline.tsx
│   │   └── common/
│   │       ├── TagBadge.tsx
│   │       └── SectionLabel.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TaskScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   └── MemoScreen.tsx
│   ├── hooks/
│   │   ├── useGoogleTasks.ts
│   │   ├── useGoogleCalendar.ts
│   │   ├── useGoogleSheets.ts
│   │   └── useRecurringTasks.ts
│   ├── lib/
│   │   ├── googleAuth.ts      # OAuth処理
│   │   ├── tasksApi.ts        # Google Tasks API wrapper
│   │   ├── calendarApi.ts     # Google Calendar API wrapper
│   │   ├── sheetsApi.ts       # Google Sheets API wrapper
│   │   ├── claudeProxy.ts     # GAS経由のClaude API呼び出し
│   │   └── parseNotes.ts      # タグパース
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts           # カテゴリ定義、カラー定義など
├── vite.config.ts
├── tsconfig.json
├── SPEC.md                    # このファイル
└── CLAUDE.md                  # Claude Code用ルール
```

---

## CLAUDE.md に書くべき内容（Claude Code用）

```markdown
# プロジェクトルール

## 概要
個人用スマホPWA。Google Tasks/Calendar連携 + Claude AIによるタスク分割。

## 開発方針
- TypeScript strict mode
- コンポーネントは小さく分割（1ファイル1責務）
- API呼び出しはすべて src/lib/ 配下に集約
- カテゴリ情報はGoogle Tasksのメモ欄に #タグ形式で保存
- Claude APIはGASプロキシ経由（APIキーをフロントに露出しない）

## 重要な制約
- Google Tasks APIのサブタスクはparent IDで親子関係を管理する
- Google Calendar APIは読み取り専用（書き込み不要）
- PWAのため、manifest.jsonとservice workerの設定必須
- ドラッグ&ドロップはPointer Events APIで実装（touch対応のため）

## カラー定義（デザイントークン）
bg: #0F0F13
surface: #1A1A22
accent: #7C6AF7
green: #4ECBA0
text: #F0EFF8
textMid: #9898B0

## カテゴリ
仕事 / プライベート / 健康 / 家事
```

---

## 開発フェーズ

### Phase 1 — 土台（まず動くものを）
- [ ] Vite + React + TypeScript プロジェクト作成
- [ ] PWA設定（manifest.json、vite-plugin-pwa）
- [ ] Google OAuth 2.0 認証
- [ ] Google Tasks API 読み取り（一覧表示）
- [ ] Google Calendar API 読み取り（当日予定）
- [ ] ホーム画面・タスク画面の基本表示

### Phase 2 — コア操作
- [ ] タスクの完了・作成・削除（Google Tasks書き込み）
- [ ] カテゴリのパース・表示（メモ欄 #タグ）
- [ ] ドラッグ&ドロップでカテゴリ変更
- [ ] カレンダー画面（週ビュー + タイムライン）

### Phase 3 — AI機能
- [ ] GASプロキシ作成（Claude API呼び出し）
- [ ] AI分割モーダル実装
- [ ] 分割結果をGoogle Tasksに保存

### Phase 4 — 拡張
- [ ] メモ画面（Google Sheets読み書き）
- [ ] 定期タスク自動生成（Google Sheets）
- [ ] GitHub Pages へのデプロイ設定

---

## 参考：モックアップ

`mockup_v3.jsx` に4画面のインタラクティブモックアップあり。  
デザイントークン・コンポーネント構成の参考にすること。

主な動作確認済み項目：
- ボトムナビ4画面切り替え
- タスクチェック（完了）
- ドラッグ&ドロップでカテゴリゾーンへ移動
- AI分割モーダル（idle → loading → result）
- カレンダー週ビュー（日付タップで切り替え）
- メモ展開

---

## 事前に必要な手動作業（Claude Codeでは対応不可）

1. **Google Cloud Console**
   - プロジェクト作成
   - OAuth 2.0 クライアントID発行（Webアプリケーション）
   - 承認済みJavaScriptオリジンに `https://{username}.github.io` を追加
   - Tasks API・Calendar API・Sheets API を有効化
   - OAuth同意画面設定（テストユーザーに自分のGmailを追加）

2. **Google Apps Script**
   - Claude API プロキシスクリプトを作成・デプロイ
   - ウェブアプリとして公開（自分のみアクセス可）
   - Anthropic APIキーをGASのスクリプトプロパティに設定

3. **GitHub**
   - リポジトリ作成
   - GitHub Pages を有効化（gh-pagesブランチ or /docs）

---

*以上が引き継ぎ仕様書です。Phase 1から順番に進めることを推奨します。*

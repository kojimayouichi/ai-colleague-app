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

```
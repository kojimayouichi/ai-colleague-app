import type { Category } from '../constants';

// タスク
export interface Task {
  id: string;
  title: string;
  notes: string;
  due: string | null;        // RFC3339形式
  completed: string | null;  // 完了日時（nullなら未完了）
  status: 'needsAction' | 'completed';
  category: Category | '未分類';
  tags: string[];
  body: string;              // メモ欄から#タグを除いた本文
  parent?: string;           // サブタスクの場合、親タスクID
}

// カレンダーイベント
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;  // ISO8601
  end: string;    // ISO8601
  color?: string;
}

// 認証状態
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

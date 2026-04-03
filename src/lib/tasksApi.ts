import { getAccessToken } from './googleAuth';
import { parseNotes } from './parseNotes';
import type { Task } from '../types';

const BASE = 'https://tasks.googleapis.com/tasks/v1';

// 認証ヘッダー
const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  'Content-Type': 'application/json',
});

// タスクリストIDを取得（最初のリストを使用）
export const fetchTaskListId = async (): Promise<string> => {
  const res = await fetch(`${BASE}/users/@me/lists`, { headers: authHeaders() });
  if (!res.ok) throw new Error('タスクリストの取得に失敗しました');
  const data = await res.json();
  return data.items[0].id as string;
};

// タスク一覧を取得してパース
export const fetchTasks = async (taskListId: string): Promise<Task[]> => {
  const params = new URLSearchParams({
    showCompleted: 'false',
    showHidden: 'false',
    maxResults: '100',
  });
  const res = await fetch(`${BASE}/lists/${taskListId}/tasks?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('タスクの取得に失敗しました');
  const data = await res.json();
  const items = (data.items ?? []) as Record<string, string>[];

  return items.map((item) => {
    const { category, tags, body } = parseNotes(item.notes);
    return {
      id: item.id,
      title: item.title,
      notes: item.notes ?? '',
      due: item.due ?? null,
      completed: item.completed ?? null,
      status: item.status as Task['status'],
      category,
      tags,
      body,
      parent: item.parent,
    };
  });
};

// 今日期限のタスクだけを抽出
export const filterTodayTasks = (tasks: Task[]): Task[] => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return tasks.filter((t) => t.due && t.due.slice(0, 10) === today && t.status === 'needsAction');
};

// タスクを完了にする
export const completeTask = async (taskListId: string, taskId: string): Promise<void> => {
  await fetch(`${BASE}/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'completed' }),
  });
};

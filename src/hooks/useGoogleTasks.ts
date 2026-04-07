import { useState, useCallback } from 'react';
import {
  fetchTaskListId,
  fetchTasks,
  completeTask,
  createTask,
  deleteTask,
  updateTaskNotes,
  updateTaskDue,
} from '../lib/tasksApi';
import { parseNotes } from '../lib/parseNotes';
import type { Task } from '../types';
import type { Category } from '../constants';

export const useGoogleTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskListId, setTaskListId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listId = await fetchTaskListId();
      setTaskListId(listId);
      const fetched = await fetchTasks(listId);
      setTasks(fetched);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(
    async (taskId: string) => {
      if (!taskListId) return;
      await completeTask(taskListId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [taskListId],
  );

  const create = useCallback(
    async (title: string, due?: string, category?: Category) => {
      if (!taskListId) return;
      const newTask = await createTask(taskListId, title, due, category);
      setTasks((prev) => [newTask, ...prev]);
    },
    [taskListId],
  );

  const remove = useCallback(
    async (taskId: string) => {
      if (!taskListId) return;
      await deleteTask(taskListId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [taskListId],
  );

  const updateCategory = useCallback(
    async (taskId: string, newCategory: Category) => {
      if (!taskListId) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // メモ欄のカテゴリタグを書き換える
      const otherTags = task.tags.filter((tag) => !['仕事','プライベート','子ども','やりたいこと'].includes(tag));
      const newNotes = [`#${newCategory}`, ...otherTags.map((t) => `#${t}`), task.body]
        .filter(Boolean)
        .join(' ');

      // ローカル即時反映
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, ...parseNotes(newNotes), notes: newNotes, category: newCategory }
            : t,
        ),
      );

      // API更新
      await updateTaskNotes(taskListId, taskId, newNotes);
    },
    [taskListId, tasks],
  );

  const updateDue = useCallback(
    async (taskId: string, due: string) => {
      if (!taskListId) return;
      // ローカル即時反映
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, due: due ? `${due}T00:00:00.000Z` : null }
            : t,
        ),
      );
      await updateTaskDue(taskListId, taskId, due);
    },
    [taskListId],
  );

  return { tasks, loading, error, load, complete, create, remove, updateCategory, updateDue };
};

import { useState, useCallback } from 'react';
import { fetchTaskListId, fetchTasks, completeTask } from '../lib/tasksApi';
import type { Task } from '../types';

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

  return { tasks, loading, error, load, complete };
};

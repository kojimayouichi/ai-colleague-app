import { useState } from 'react';
import { appendMemo, fetchMemos, updateMemo, deleteMemo } from '../lib/sheetsApi';
import type { Memo } from '../types';

export const useSheets = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMemos();
      setMemos(data);
    } finally {
      setLoading(false);
    }
  };

  const addMemo = async (text: string) => {
    await appendMemo(text);
    await load();
  };

  const editMemo = async (rowIndex: number, text: string) => {
    await updateMemo(rowIndex, text);
    await load();
  };

  const removeMemo = async (rowIndex: number) => {
    await deleteMemo(rowIndex);
    await load();
  };

  return { memos, loading, load, addMemo, editMemo, removeMemo };
};

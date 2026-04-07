import { useState } from 'react';
import { appendMemo, fetchMemos } from '../lib/sheetsApi';
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

  return { memos, loading, load, addMemo };
};

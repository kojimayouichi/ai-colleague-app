import { CATEGORIES } from '../constants';
import type { Category } from '../constants';

interface ParsedNotes {
  category: Category | '未分類';
  tags: string[];
  body: string;
}

// メモ欄から #カテゴリ・#タグ を抽出する
export const parseNotes = (notes: string | undefined | null): ParsedNotes => {
  if (!notes) return { category: '未分類', tags: [], body: '' };

  const tags = (notes.match(/#[\w\u3040-\u9FFF]+/g) || []).map((t) => t.slice(1));
  const category = (CATEGORIES.find((c) => tags.includes(c)) ?? '未分類') as Category | '未分類';
  const body = notes.replace(/#[\w\u3040-\u9FFF]+/g, '').trim();

  return { category, tags, body };
};

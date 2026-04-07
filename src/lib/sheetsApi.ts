import { getAccessToken } from './googleAuth';
import { SPREADSHEET_ID } from '../constants';
import type { Memo } from '../types';

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_NAME = 'メモ';

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  'Content-Type': 'application/json',
});

// メモを追記する（A列：日時、B列：本文）
export const appendMemo = async (text: string): Promise<void> => {
  const now = new Date().toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const range = `${SHEET_NAME}!A:B`;
  const res = await fetch(
    `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ values: [[now, text]] }),
    },
  );
  if (!res.ok) throw new Error('メモの追加に失敗しました');
};

// メモ一覧を取得する（新しい順）
export const fetchMemos = async (): Promise<Memo[]> => {
  const range = `${SHEET_NAME}!A:B`;
  const res = await fetch(
    `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error('メモの取得に失敗しました');
  const data = await res.json();
  const rows = (data.values ?? []) as string[][];
  return rows
    .map(([datetime, text]) => ({ datetime: datetime ?? '', text: text ?? '' }))
    .reverse();
};

import { getAccessToken } from './googleAuth';
import { SPREADSHEET_ID } from '../constants';
import type { Memo } from '../types';

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_NAME = 'メモ';

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  'Content-Type': 'application/json',
});

// "メモ"シートの数値IDを取得（削除APIに必要）
let cachedSheetId: number | null = null;
const getSheetId = async (): Promise<number> => {
  if (cachedSheetId !== null) return cachedSheetId;
  const res = await fetch(
    `${BASE}/${SPREADSHEET_ID}?fields=sheets.properties`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error('シート情報の取得に失敗しました');
  const data = await res.json();
  const sheet = (data.sheets as { properties: { sheetId: number; title: string } }[])
    .find((s) => s.properties.title === SHEET_NAME);
  if (!sheet) throw new Error(`"${SHEET_NAME}"シートが見つかりません`);
  cachedSheetId = sheet.properties.sheetId;
  return cachedSheetId;
};

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

// メモ一覧を取得する（新しい順、行番号付き）
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
    .map((row, i) => ({
      datetime: row[0] ?? '',
      text: row[1] ?? '',
      rowIndex: i + 1, // 1-based
    }))
    .reverse();
};

// メモのB列（本文）を更新する
export const updateMemo = async (rowIndex: number, text: string): Promise<void> => {
  const range = `${SHEET_NAME}!B${rowIndex}`;
  const res = await fetch(
    `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ values: [[text]] }),
    },
  );
  if (!res.ok) throw new Error('メモの更新に失敗しました');
};

// メモの行を削除する
export const deleteMemo = async (rowIndex: number): Promise<void> => {
  const sheetId = await getSheetId();
  const res = await fetch(
    `${BASE}/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-based
              endIndex: rowIndex,
            },
          },
        }],
      }),
    },
  );
  if (!res.ok) throw new Error('メモの削除に失敗しました');
};

import { getAccessToken } from './googleAuth';
import type { CalendarEvent } from '../types';

const BASE = 'https://www.googleapis.com/calendar/v3';

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
});

export interface CalendarInfo {
  id: string;
  name: string;
  color: string;
}

// ユーザーが購読している全カレンダーの一覧を取得
export const fetchCalendarList = async (): Promise<CalendarInfo[]> => {
  const res = await fetch(`${BASE}/users/me/calendarList?minAccessRole=reader`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('カレンダー一覧の取得に失敗しました');

  const data = await res.json();
  const items = (data.items ?? []) as Record<string, unknown>[];

  return items.map((item) => ({
    id: item.id as string,
    name: item.summary as string,
    color: (item.backgroundColor as string) ?? '#7C6AF7',
  }));
};

// 指定月の日付範囲を返す（month は 0-indexed）
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { start, end };
};

// 指定カレンダーの月イベントを取得
const fetchMonthEventsFromCalendar = async (
  year: number,
  month: number,
  calendar: CalendarInfo,
): Promise<CalendarEvent[]> => {
  const { start, end } = getMonthRange(year, month);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '200',
  });

  const res = await fetch(
    `${BASE}/calendars/${encodeURIComponent(calendar.id)}/events?${params}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`${calendar.name} の取得に失敗しました`);

  const data = await res.json();
  const items = (data.items ?? []) as Record<string, unknown>[];

  return items.map((item) => {
    const startObj = item.start as Record<string, string>;
    const endObj = item.end as Record<string, string>;
    return {
      id: `${calendar.id}_${item.id as string}`,
      title: item.summary as string,
      start: startObj.dateTime ?? startObj.date,
      end: endObj.dateTime ?? endObj.date,
      color: calendar.color,
      calendarName: calendar.name,
    };
  });
};

// 全カレンダー（共有含む）の月イベントを並行取得してマージ
export const fetchAllMonthEvents = async (year: number, month: number): Promise<CalendarEvent[]> => {
  const calendars = await fetchCalendarList();
  const results = await Promise.allSettled(
    calendars.map((cal) => fetchMonthEventsFromCalendar(year, month, cal)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<CalendarEvent[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => a.start.localeCompare(b.start));
};

// 今日の予定を取得（primaryカレンダー・読み取り専用）
export const fetchTodayEvents = async (): Promise<CalendarEvent[]> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '20',
  });

  const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('カレンダーの取得に失敗しました');

  const data = await res.json();
  const items = (data.items ?? []) as Record<string, unknown>[];

  return items.map((item) => {
    const startObj = item.start as Record<string, string>;
    const endObj = item.end as Record<string, string>;
    return {
      id: item.id as string,
      title: item.summary as string,
      start: startObj.dateTime ?? startObj.date,
      end: endObj.dateTime ?? endObj.date,
    };
  });
};

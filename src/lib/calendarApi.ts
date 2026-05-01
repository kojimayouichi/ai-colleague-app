import { getAccessToken } from './googleAuth';
import type { CalendarEvent } from '../types';

const BASE = 'https://www.googleapis.com/calendar/v3';

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
});

// 指定日を含む週（月〜日）の日付範囲を返す
export const getWeekRange = (date: Date): { start: Date; end: Date; days: Date[] } => {
  const d = new Date(date);
  const dow = d.getDay(); // 0=日
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });

  const end = new Date(monday);
  end.setDate(monday.getDate() + 7);

  return { start: monday, end, days };
};

// 指定した週の予定を取得
export const fetchWeekEvents = async (date: Date): Promise<CalendarEvent[]> => {
  const { start, end } = getWeekRange(date);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
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

// 指定月の日付範囲を返す（month は 0-indexed）
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
  return { start, end };
};

// 指定月の予定を取得（month は 0-indexed）
export const fetchMonthEvents = async (year: number, month: number): Promise<CalendarEvent[]> => {
  const { start, end } = getMonthRange(year, month);

  const params = new URLSearchParams({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '200',
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

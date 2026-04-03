import { getAccessToken } from './googleAuth';
import type { CalendarEvent } from '../types';

const BASE = 'https://www.googleapis.com/calendar/v3';

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
});

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

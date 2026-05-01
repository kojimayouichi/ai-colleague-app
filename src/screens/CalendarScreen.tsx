import { useEffect } from 'react';
import { C } from '../constants';
import type { CalendarEvent } from '../types';

interface Props {
  monthEvents: CalendarEvent[];
  currentMonth: { year: number; month: number };
  loading: boolean;
  onLoadMonth: (year: number, month: number) => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isAllDay = (iso: string) => !iso.includes('T');

const fmtTime = (iso: string): string | null => {
  if (isAllDay(iso)) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getLocalDate = (iso: string): Date => {
  if (isAllDay(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
};

const CalendarScreen = ({ monthEvents, currentMonth, loading, onLoadMonth }: Props) => {
  const { year, month } = currentMonth;

  useEffect(() => {
    onLoadMonth(year, month);
  }, []);

  const today = new Date();

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onLoadMonth(d.getFullYear(), d.getMonth());
  };

  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onLoadMonth(d.getFullYear(), d.getMonth());
  };

  // イベントを日付キー（YYYY-MM-DD）でグループ化
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const ev of monthEvents) {
    const d = getLocalDate(ev.start);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push(ev);
  }
  const sortedDays = Array.from(eventsByDay.keys()).sort();

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 月ナビゲーション */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          padding: '16px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 24, padding: '4px 10px', lineHeight: 1 }}
        >
          ‹
        </button>
        <span style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>
          {year}年{month + 1}月
        </span>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 24, padding: '4px 10px', lineHeight: 1 }}
        >
          ›
        </button>
      </div>

      {/* イベントリスト */}
      <div style={{ padding: '16px 16px 0' }}>
        {loading && (
          <div style={{ color: C.textMid, textAlign: 'center', padding: 48, fontSize: 13 }}>読み込み中...</div>
        )}

        {!loading && sortedDays.length === 0 && (
          <div style={{ color: C.textDim, textAlign: 'center', padding: 48, fontSize: 13 }}>
            この月の予定はなし
          </div>
        )}

        {sortedDays.map((key) => {
          const [y, m, d] = key.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          const isToday = isSameDay(date, today);
          const isSun = date.getDay() === 0;
          const isSat = date.getDay() === 6;
          const dayLabel = DAY_LABELS[date.getDay()];
          const dayColor = isSun ? C.red : isSat ? '#7CA8F7' : C.text;
          const dayLabelColor = isSun ? C.red : isSat ? '#7CA8F7' : C.textMid;
          const events = eventsByDay.get(key)!;

          return (
            <div key={key} style={{ marginBottom: 20 }}>
              {/* 日付ヘッダー */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: isToday ? C.accent : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: isToday ? C.text : dayColor,
                      fontSize: 17,
                      fontWeight: isToday ? 700 : 500,
                      lineHeight: 1.1,
                    }}
                  >
                    {d}
                  </span>
                  <span
                    style={{
                      color: isToday ? `${C.text}CC` : dayLabelColor,
                      fontSize: 9,
                      lineHeight: 1,
                    }}
                  >
                    {dayLabel}
                  </span>
                </div>
              </div>

              {/* イベントカード */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  paddingLeft: 16,
                  borderLeft: `2px solid ${isToday ? C.accent : C.border}`,
                  marginLeft: 20,
                }}
              >
                {events.map((ev) => {
                  const startTime = fmtTime(ev.start);
                  const endTime = fmtTime(ev.end);
                  return (
                    <div
                      key={ev.id}
                      style={{
                        background: C.surface,
                        borderRadius: 8,
                        padding: '8px 12px',
                        borderLeft: `3px solid ${ev.color ?? C.accent}`,
                      }}
                    >
                      <div style={{ color: C.textMid, fontSize: 11, marginBottom: 2 }}>
                        {startTime ? `${startTime}${endTime ? ` - ${endTime}` : ''}` : '終日'}
                      </div>
                      <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{ev.title}</div>
                      {ev.calendarName && (
                        <div style={{ color: C.textDim, fontSize: 10, marginTop: 3 }}>{ev.calendarName}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarScreen;

import { useEffect } from 'react';
import { C } from '../constants';
import type { CalendarEvent, Task } from '../types';

interface Props {
  weekDays: Date[];
  weekEvents: CalendarEvent[];
  selectedDate: Date;
  tasks: Task[];
  loading: boolean;
  onSelectDate: (date: Date) => void;
  onLoadWeek: (date: Date) => void;
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8〜21時

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const CalendarScreen = ({ weekDays, weekEvents, selectedDate, tasks, loading, onSelectDate, onLoadWeek }: Props) => {
  // 初回ロード
  useEffect(() => {
    onLoadWeek(selectedDate);
  }, []);

  // 選択日のイベント
  const dayEvents = weekEvents.filter((ev) => isSameDay(new Date(ev.start), selectedDate));

  // タスク期限ドット（週ビュー用）
  const taskDotsByDay = weekDays.map((day) =>
    tasks.filter((t) => t.due && isSameDay(new Date(t.due), day)),
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* 週ビュー */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 8px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingInline: 4 }}>
          <button
            onClick={() => {
              const prev = new Date(weekDays[0]);
              prev.setDate(prev.getDate() - 7);
              onLoadWeek(prev);
            }}
            style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 18 }}
          >‹</button>
          <span style={{ color: C.textMid, fontSize: 12 }}>
            {weekDays[0]?.getMonth() + 1}月
          </span>
          <button
            onClick={() => {
              const next = new Date(weekDays[0]);
              next.setDate(next.getDate() + 7);
              onLoadWeek(next);
            }}
            style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 18 }}
          >›</button>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dots = taskDotsByDay[i];
            return (
              <button
                key={i}
                onClick={() => onSelectDate(day)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 10,
                  background: isSelected ? C.accent : isToday ? C.accentSoft : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: isSelected ? C.text : C.textMid, fontSize: 10 }}>
                  {DAY_LABELS[i]}
                </span>
                <span style={{ color: isSelected ? C.text : isToday ? C.accent : C.text, fontSize: 16, fontWeight: isToday ? 700 : 400 }}>
                  {day.getDate()}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {dots.slice(0, 3).map((t) => (
                    <span key={t.id} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? C.text : C.accent }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* タイムライン */}
      <div style={{ padding: '8px 0' }}>
        {loading && <div style={{ color: C.textMid, textAlign: 'center', padding: 24 }}>読み込み中...</div>}

        {dayEvents.length === 0 && !loading && (
          <div style={{ color: C.textDim, textAlign: 'center', padding: 24, fontSize: 13 }}>この日の予定なし</div>
        )}

        {HOURS.map((hour) => {
          const hourEvents = dayEvents.filter((ev) => {
            const h = new Date(ev.start).getHours();
            return h === hour;
          });
          return (
            <div key={hour} style={{ display: 'flex', minHeight: 56, borderBottom: `1px solid ${C.border}20` }}>
              {/* 時刻ラベル */}
              <div style={{ width: 44, paddingTop: 8, paddingLeft: 12, color: C.textDim, fontSize: 11, flexShrink: 0 }}>
                {String(hour).padStart(2, '0')}:00
              </div>
              {/* イベント */}
              <div style={{ flex: 1, padding: '6px 12px 6px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {hourEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      background: C.accentSoft,
                      border: `1px solid ${C.accent}40`,
                      borderLeft: `3px solid ${C.accent}`,
                      borderRadius: 6,
                      padding: '4px 8px',
                    }}
                  >
                    <div style={{ color: C.textMid, fontSize: 10 }}>
                      {fmtTime(ev.start)} - {fmtTime(ev.end)}
                    </div>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{ev.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarScreen;

import { useEffect, useState } from 'react';
import { C, CATEGORY_COLORS, localDateStr } from '../constants';
import type { Task, CalendarEvent } from '../types';

const GAS_URL =
  'https://script.google.com/macros/s/AKfycbzdhPmtd6XlXXcz2HRKdKP9oq6HDhL_uDfgus2FUaZ0SdpaEj-SGvhvXy2zRqyFO079oA/exec';

interface Props {
  tasks: Task[];
  events: CalendarEvent[];
  loading: boolean;
}

// 時刻文字列を HH:MM 形式に
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// 挨拶文
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'おはよう！';
  if (h < 18) return 'こんにちは！';
  return 'こんばんは！';
};

// 今日の日付
const todayLabel = () => {
  const d = new Date();
  const week = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${week[d.getDay()]}）`;
};

const HomeScreen = ({ tasks, events, loading }: Props) => {
  const [haikuMsg, setHaikuMsg] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    fetch(`${GAS_URL}?hour=${hour}`)
      .then((r) => r.json())
      .then((d) => setHaikuMsg(d.message ?? ''))
      .catch(() => {});
  }, []);

  const todayTasks = tasks.filter(
    (t) => t.due && t.due.slice(0, 10) === localDateStr(),
  );

  return (
    <div style={{ padding: '20px 16px 80px' }}>
      {/* 日付・挨拶 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: C.textMid, fontSize: 13, marginBottom: 4 }}>{todayLabel()}</div>
        <div style={{ color: C.text, fontSize: 24, fontWeight: 700 }}>{greeting()}</div>
        {haikuMsg && (
          <div style={{ color: C.textMid, fontSize: 14, marginTop: 6 }}>{haikuMsg}</div>
        )}
      </div>

      {loading && (
        <div style={{ color: C.textMid, textAlign: 'center', padding: 32 }}>読み込み中...</div>
      )}

      {/* 今日の予定 */}
      {events.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div
            style={{
              color: C.textMid,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            今日の予定
          </div>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 36,
                  borderRadius: 2,
                  background: C.accent,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ color: C.textMid, fontSize: 11 }}>{fmtTime(ev.start)}</div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{ev.title}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 今日やること */}
      {todayTasks.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div
            style={{
              color: C.textMid,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            今日やること
          </div>
          {todayTasks.slice(0, 3).map((task) => {
            const col = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS['未分類'];
            return (
              <div
                key={task.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: col.dot,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: C.text, fontSize: 14 }}>{task.title}</span>
              </div>
            );
          })}
          {todayTasks.length > 3 && (
            <div style={{ color: C.textMid, fontSize: 12, textAlign: 'center' }}>
              他 {todayTasks.length - 3} 件
            </div>
          )}
        </section>
      )}

      {!loading && todayTasks.length === 0 && events.length === 0 && (
        <div style={{ color: C.textMid, textAlign: 'center', padding: 32 }}>
          今日の予定・タスクはなし！
        </div>
      )}
    </div>
  );
};

export default HomeScreen;

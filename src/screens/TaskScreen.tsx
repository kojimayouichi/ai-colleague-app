import { C, CATEGORIES, CATEGORY_COLORS } from '../constants';
import TaskCard from '../components/tasks/TaskCard';
import type { Task, CalendarEvent } from '../types';

interface Props {
  tasks: Task[];
  events: CalendarEvent[];
  loading: boolean;
  onComplete: (id: string) => void;
}

const SLabel = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </div>
);

// 時刻文字列を HH:MM 形式に
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const TaskScreen = ({ tasks, events, loading, onComplete }: Props) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.due?.slice(0, 10) === todayStr);

  // カテゴリ別タスク（今日以外も含む）
  const tasksByCategory = CATEGORIES.map((cat) => ({
    cat,
    items: tasks.filter((t) => t.category === cat && t.due?.slice(0, 10) !== todayStr),
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ padding: '20px 16px 80px' }}>
      <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>タスク</div>

      {loading && (
        <div style={{ color: C.textMid, textAlign: 'center', padding: 32 }}>読み込み中...</div>
      )}

      {/* ① 今日やること */}
      <section style={{ marginBottom: 28 }}>
        <SLabel>① 今日やること</SLabel>
        {todayTasks.length === 0 && !loading && (
          <div style={{ color: C.textDim, fontSize: 13 }}>今日期限のタスクなし</div>
        )}
        {todayTasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} />
        ))}
      </section>

      {/* ② カテゴリ別やること */}
      <section style={{ marginBottom: 28 }}>
        <SLabel>② カテゴリ別</SLabel>
        {tasksByCategory.length === 0 && !loading && (
          <div style={{ color: C.textDim, fontSize: 13 }}>他のタスクなし</div>
        )}
        {tasksByCategory.map(({ cat, items }) => {
          const col = CATEGORY_COLORS[cat];
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  padding: '8px 12px',
                  background: col.bg,
                  borderRadius: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                <span style={{ color: col.color, fontSize: 13, fontWeight: 700 }}>{cat}</span>
                <span style={{ color: col.color, fontSize: 12, marginLeft: 'auto' }}>
                  {items.length}件
                </span>
              </div>
              {items.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={onComplete} />
              ))}
            </div>
          );
        })}
      </section>

      {/* ③ 今日の予定 */}
      {events.length > 0 && (
        <section>
          <SLabel>③ 今日の予定</SLabel>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: C.surfaceHigh,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
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
    </div>
  );
};

export default TaskScreen;

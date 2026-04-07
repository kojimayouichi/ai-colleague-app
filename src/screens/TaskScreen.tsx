import { useState, useRef, useEffect, useCallback } from 'react';
import { C, CATEGORIES } from '../constants';
import type { Category } from '../constants';
import DraggableTaskCard from '../components/tasks/DraggableTaskCard';
import CategoryZone from '../components/tasks/CategoryZone';
import type { Task, CalendarEvent } from '../types';

interface Props {
  tasks: Task[];
  events: CalendarEvent[];
  loading: boolean;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onCreate: (title: string, due?: string, category?: Category) => void;
  onUpdateCategory: (taskId: string, cat: Category) => void;
  onUpdateDue: (taskId: string, due: string) => void;
}

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const SLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: C.textMid, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
    {children}
  </div>
);

const TaskScreen = ({ tasks, events, loading, onComplete, onRemove, onCreate, onUpdateCategory, onUpdateDue }: Props) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.due?.slice(0, 10) === todayStr);
  const tasksByCategory = CATEGORIES.map((cat) => ({
    cat,
    items: tasks.filter((t) => t.category === cat && t.due?.slice(0, 10) !== todayStr),
  }));
  // カテゴリなし（未分類）タスク
  const uncategorizedTasks = tasks.filter(
    (t) => t.category === '未分類' && t.due?.slice(0, 10) !== todayStr,
  );

  // アコーディオン開閉状態
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c, true])),
  );

  // タスク追加フォーム
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newCat, setNewCat] = useState<Category>('仕事');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreate(newTitle.trim(), newDue || undefined, newCat);
    setNewTitle('');
    setNewDue('');
  };

  // ── ドラッグ&ドロップ ────────────────────────────────────
  const [dragTask, setDragTask] = useState<Task | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [dragOverCat, setDragOverCat] = useState<Category | null>(null);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDragStart = useCallback((task: Task, startX: number, startY: number) => {
    setDragTask(task);
    setGhostPos({ x: startX, y: startY });
  }, []);

  useEffect(() => {
    if (!dragTask) return;

    const onMove = (e: PointerEvent) => {
      setGhostPos({ x: e.clientX, y: e.clientY });

      // どのカテゴリゾーンの上にいるか判定
      let found: Category | null = null;
      for (const cat of CATEGORIES) {
        const el = catRefs.current[cat];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          found = cat;
          break;
        }
      }
      setDragOverCat(found);
    };

    const onUp = () => {
      if (dragTask && dragOverCat && dragOverCat !== dragTask.category) {
        onUpdateCategory(dragTask.id, dragOverCat);
      }
      setDragTask(null);
      setDragOverCat(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragTask, dragOverCat, onUpdateCategory]);

  return (
    <div style={{ padding: '20px 16px 180px', position: 'relative' }}>
      <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>タスク</div>

      {loading && <div style={{ color: C.textMid, textAlign: 'center', padding: 32 }}>読み込み中...</div>}

      {/* ① 今日やること */}
      <section style={{ marginBottom: 28 }}>
        <SLabel>① 今日やること</SLabel>
        {todayTasks.length === 0 && !loading && (
          <div style={{ color: C.textDim, fontSize: 13 }}>今日期限のタスクなし</div>
        )}
        {todayTasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onComplete={onComplete} onRemove={onRemove} onUpdateDue={onUpdateDue} onDragStart={handleDragStart} />
        ))}
      </section>

      {/* ② カテゴリ別 */}
      <section style={{ marginBottom: 28 }}>
        <SLabel>② カテゴリ別</SLabel>
        {CATEGORIES.map((cat) => {
          const items = tasksByCategory.find((g) => g.cat === cat)?.items ?? [];
          return (
            <CategoryZone
              key={cat}
              ref={(el) => { catRefs.current[cat] = el; }}
              category={cat}
              isOver={dragOverCat === cat}
              isOpen={openCats[cat]}
              onToggle={() => setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }))}
            >
              {items.length === 0 ? (
                <div style={{ color: C.textDim, fontSize: 12, padding: '4px 12px 8px' }}>タスクなし</div>
              ) : (
                items.map((task) => (
                  <DraggableTaskCard key={task.id} task={task} onComplete={onComplete} onRemove={onRemove} onUpdateDue={onUpdateDue} onDragStart={handleDragStart} />
                ))
              )}
            </CategoryZone>
          );
        })}
      </section>

      {/* 未分類タスク */}
      {uncategorizedTasks.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SLabel>未分類</SLabel>
          {uncategorizedTasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} onComplete={onComplete} onRemove={onRemove} onUpdateDue={onUpdateDue} onDragStart={handleDragStart} />
          ))}
        </section>
      )}

      {/* ③ 今日の予定（カレンダーから） */}
      {events.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SLabel>③ 今日の予定</SLabel>
          {events.map((ev) => (
            <div key={ev.id} style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 36, borderRadius: 2, background: C.accent, flexShrink: 0 }} />
              <div>
                <div style={{ color: C.textMid, fontSize: 11 }}>{fmtTime(ev.start)}</div>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{ev.title}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* タスク追加フォーム */}
      <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, padding: '12px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="新しいタスク..."
            style={{ flex: 1, background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', color: C.text, fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={handleCreate}
            style={{ background: C.accent, border: 'none', borderRadius: 8, padding: '8px 14px', color: C.text, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
          >
            +
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            style={{ flex: 1, background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none' }}
          />
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value as Category)}
            style={{ flex: 1, background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', color: C.text, fontSize: 12, outline: 'none' }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ドラッグゴースト */}
      {dragTask && (
        <div style={{ position: 'fixed', left: ghostPos.x - 20, top: ghostPos.y - 20, background: C.surface, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '8px 14px', color: C.text, fontSize: 13, fontWeight: 600, pointerEvents: 'none', zIndex: 300, opacity: 0.9, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {dragTask.title}
        </div>
      )}
    </div>
  );
};

export default TaskScreen;

import { useRef } from 'react';
import { C } from '../../constants';
import TagBadge from '../common/TagBadge';
import type { Task } from '../../types';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateDue: (id: string, due: string) => void;
  onDragStart: (task: Task, startX: number, startY: number) => void;
}

const DraggableTaskCard = ({ task, onComplete, onRemove, onUpdateDue, onDragStart }: Props) => {
  const gripRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onDragStart(task, e.clientX, e.clientY);
  };

  // 期限表示をタップしたらdate pickerを開く
  const handleDueTap = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  const currentDue = task.due ? task.due.slice(0, 10) : '';

  return (
    <div
      style={{
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
        touchAction: 'none',
      }}
    >
      {/* グリップハンドル */}
      <div
        ref={gripRef}
        onPointerDown={handlePointerDown}
        style={{ color: C.textDim, fontSize: 16, cursor: 'grab', padding: '2px 4px', flexShrink: 0, userSelect: 'none' }}
      >
        ⠿
      </div>

      {/* チェックボックス */}
      <button
        onClick={() => onComplete(task.id)}
        style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${C.border}`, background: 'none', cursor: 'pointer', flexShrink: 0 }}
      />

      {/* タイトル・タグ */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TagBadge label={task.category} />

          {/* 期限タップでdate picker */}
          <div style={{ position: 'relative' }}>
            <span
              onClick={handleDueTap}
              style={{
                color: task.due ? C.textMid : C.textDim,
                fontSize: 11,
                cursor: 'pointer',
                padding: '1px 6px',
                borderRadius: 4,
                border: `1px solid ${C.border}`,
                background: C.surface,
              }}
            >
              {task.due ? task.due.slice(5, 10).replace('-', '/') : '期限なし'}
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={currentDue}
              onChange={(e) => onUpdateDue(task.id, e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1, top: 0, left: 0, pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onRemove(task.id)}
        style={{ color: C.textDim, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
};

export default DraggableTaskCard;

import { useRef } from 'react';
import { C } from '../../constants';
import TagBadge from '../common/TagBadge';
import type { Task } from '../../types';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (task: Task, startX: number, startY: number) => void;
}

const DraggableTaskCard = ({ task, onComplete, onRemove, onDragStart }: Props) => {
  const gripRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onDragStart(task, e.clientX, e.clientY);
  };

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
        style={{
          color: C.textDim,
          fontSize: 16,
          cursor: 'grab',
          padding: '2px 4px',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        ⠿
      </div>

      {/* チェックボックス */}
      <button
        onClick={() => onComplete(task.id)}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `2px solid ${C.border}`,
          background: 'none',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />

      {/* タイトル・タグ */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: C.text,
            fontSize: 14,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
          <TagBadge label={task.category} />
          {task.due && (
            <span style={{ color: C.textDim, fontSize: 11, alignSelf: 'center' }}>
              {task.due.slice(5, 10).replace('-', '/')}
            </span>
          )}
        </div>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onRemove(task.id)}
        style={{
          color: C.textDim,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          padding: '0 4px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DraggableTaskCard;

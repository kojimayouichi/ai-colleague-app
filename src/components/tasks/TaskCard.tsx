import { C } from '../../constants';
import TagBadge from '../common/TagBadge';
import type { Task } from '../../types';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskCard = ({ task, onComplete }: Props) => (
  <div
    style={{
      background: C.surfaceHigh,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    }}
  >
    {/* チェックボックス */}
    <button
      onClick={() => onComplete(task.id)}
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `2px solid ${C.border}`,
        background: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
        <TagBadge label={task.category} />
        {task.due && (
          <span style={{ color: C.textDim, fontSize: 11 }}>
            {task.due.slice(5, 10).replace('-', '/')}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default TaskCard;

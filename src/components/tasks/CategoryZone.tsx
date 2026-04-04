import { forwardRef } from 'react';
import { CATEGORY_COLORS } from '../../constants';
import type { Category } from '../../constants';

interface Props {
  category: Category;
  isOver: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CategoryZone = forwardRef<HTMLDivElement, Props>(
  ({ category, isOver, isOpen, onToggle, children }, ref) => {
    const col = CATEGORY_COLORS[category];

    return (
      <div
        ref={ref}
        style={{
          marginBottom: 16,
          borderRadius: 12,
          border: `2px solid ${isOver ? col.dot : 'transparent'}`,
          transition: 'border-color 0.15s',
          padding: isOver ? 4 : 0,
        }}
      >
        {/* カテゴリヘッダー（タップで開閉） */}
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: isOver ? col.bg + '80' : col.bg,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            marginBottom: isOpen ? 8 : 0,
            transition: 'background 0.15s',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, flexShrink: 0 }} />
          <span style={{ color: col.color, fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'left' }}>
            {category}
          </span>
          <span style={{ color: col.color, fontSize: 12 }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {/* タスク一覧（アコーディオン） */}
        {isOpen && <div>{children}</div>}
      </div>
    );
  },
);

CategoryZone.displayName = 'CategoryZone';

export default CategoryZone;

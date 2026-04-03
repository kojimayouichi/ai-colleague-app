import { CATEGORY_COLORS } from '../../constants';

interface Props {
  label: string;
}

const TagBadge = ({ label }: Props) => {
  const s = CATEGORY_COLORS[label] ?? CATEGORY_COLORS['未分類'];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
      {label}
    </span>
  );
};

export default TagBadge;

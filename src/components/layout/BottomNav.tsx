import { C } from '../../constants';

export type Screen = 'home' | 'tasks' | 'calendar' | 'memo';

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '⌂' },
  { id: 'tasks', label: 'タスク', icon: '✓' },
  { id: 'calendar', label: 'カレンダー', icon: '◻' },
  { id: 'memo', label: 'メモ', icon: '≡' },
];

const tabStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center' as const,
  gap: 3,
  padding: '8px 0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
};

interface Props {
  active: Screen;
  onChange: (screen: Screen) => void;
  gasManagerUrl: string;
}

const BottomNav = ({ active, onChange, gasManagerUrl }: Props) => (
  <nav
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
    }}
  >
    {TABS.map((tab) => {
      const isActive = tab.id === active;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{ ...tabStyle, color: isActive ? C.accent : C.textDim }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{tab.label}</span>
        </button>
      );
    })}
    {gasManagerUrl && (
      <a
        href={`${gasManagerUrl}?type=gallery`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...tabStyle, color: C.textDim }}
      >
        <span style={{ fontSize: 20 }}>✨</span>
        <span style={{ fontSize: 10 }}>いいこと</span>
      </a>
    )}
  </nav>
);

export default BottomNav;

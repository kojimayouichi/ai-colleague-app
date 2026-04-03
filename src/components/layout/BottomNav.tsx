import { C } from '../../constants';

export type Screen = 'home' | 'tasks' | 'calendar' | 'memo';

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '⌂' },
  { id: 'tasks', label: 'タスク', icon: '✓' },
  { id: 'calendar', label: 'カレンダー', icon: '◻' },
  { id: 'memo', label: 'メモ', icon: '≡' },
];

interface Props {
  active: Screen;
  onChange: (screen: Screen) => void;
}

const BottomNav = ({ active, onChange }: Props) => (
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
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '8px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isActive ? C.accent : C.textDim,
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{tab.label}</span>
        </button>
      );
    })}
  </nav>
);

export default BottomNav;

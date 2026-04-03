import { C } from '../constants';

const CalendarScreen = () => (
  <div
    style={{
      padding: '20px 16px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
    <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
      カレンダー
    </div>
    <div style={{ color: C.textMid, fontSize: 14 }}>Phase 2 で実装予定</div>
  </div>
);

export default CalendarScreen;

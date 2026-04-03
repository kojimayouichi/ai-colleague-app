import { useState, useEffect } from 'react';
import { C } from './constants';
import { signIn } from './lib/googleAuth';
import { useGoogleTasks } from './hooks/useGoogleTasks';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import BottomNav, { type Screen } from './components/layout/BottomNav';
import HomeScreen from './screens/HomeScreen';
import TaskScreen from './screens/TaskScreen';
import CalendarScreen from './screens/CalendarScreen';
import MemoScreen from './screens/MemoScreen';

const App = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { tasks, loading: tasksLoading, load: loadTasks, complete } = useGoogleTasks();
  const { events, loading: calLoading, load: loadCalendar } = useGoogleCalendar();

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signIn();
      setIsAuthenticated(true);
    } catch {
      setAuthError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setAuthLoading(false);
    }
  };

  // 認証後にデータを取得
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
      loadCalendar();
    }
  }, [isAuthenticated]);

  const loading = tasksLoading || calLoading;

  // ─── ログイン画面 ───────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          <div style={{ color: C.text, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            AI秘書ちゃん
          </div>
          <div style={{ color: C.textMid, fontSize: 14 }}>
            タスク・スケジュールをスマートに管理
          </div>
        </div>

        {authError && (
          <div
            style={{
              color: C.red,
              fontSize: 13,
              marginBottom: 16,
              padding: '10px 16px',
              background: '#F27B7B15',
              borderRadius: 8,
              border: `1px solid ${C.red}40`,
            }}
          >
            {authError}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={authLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 28px',
            borderRadius: 14,
            background: authLoading ? C.border : C.accent,
            border: 'none',
            color: C.text,
            fontSize: 15,
            fontWeight: 700,
            cursor: authLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: 320,
            justifyContent: 'center',
          }}
        >
          {authLoading ? '接続中...' : 'Googleでログイン'}
        </button>

        <div style={{ color: C.textDim, fontSize: 11, marginTop: 20, textAlign: 'center' }}>
          個人利用のみ。Google Tasks・Calendar・Sheets にアクセスします。
        </div>
      </div>
    );
  }

  // ─── メイン画面 ────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen tasks={tasks} events={events} loading={loading} />;
      case 'tasks':
        return (
          <TaskScreen tasks={tasks} events={events} loading={loading} onComplete={complete} />
        );
      case 'calendar':
        return <CalendarScreen />;
      case 'memo':
        return <MemoScreen />;
    }
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: '100dvh',
        fontFamily: 'system-ui, sans-serif',
        color: C.text,
      }}
    >
      {renderScreen()}
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
};

export default App;

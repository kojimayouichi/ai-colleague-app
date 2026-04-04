import { useState, useEffect } from 'react';
import { C } from './constants';
import { redirectToSignIn, exchangeCodeForToken } from './lib/googleAuth';
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

  const { tasks, loading: tasksLoading, load: loadTasks, complete, create, remove, updateCategory } = useGoogleTasks();
  const { events, weekEvents, weekDays, selectedDate, loading: calLoading, load: loadCalendar, loadWeek, setSelectedDate } = useGoogleCalendar();

  // 起動時にURLの認証コードをトークンに交換
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      exchangeCodeForToken().then((token) => {
        if (token) setIsAuthenticated(true);
      });
    }
  }, []);

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

        <button
          onClick={redirectToSignIn}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 28px',
            borderRadius: 14,
            background: C.accent,
            border: 'none',
            color: C.text,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%',
            maxWidth: 320,
            justifyContent: 'center',
          }}
        >
          Googleでログイン
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
          <TaskScreen tasks={tasks} events={events} loading={loading} onComplete={complete} onRemove={remove} onCreate={create} onUpdateCategory={updateCategory} />
        );
      case 'calendar':
        return <CalendarScreen weekDays={weekDays} weekEvents={weekEvents} selectedDate={selectedDate} tasks={tasks} loading={calLoading} onSelectDate={setSelectedDate} onLoadWeek={loadWeek} />;
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

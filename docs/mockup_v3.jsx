import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#0F0F13", surface:"#1A1A22", surfaceHigh:"#22222E",
  border:"#2E2E3E", accent:"#7C6AF7", accentSoft:"#7C6AF720",
  green:"#4ECBA0", greenSoft:"#4ECBA015",
  yellow:"#F5C842", red:"#F27B7B",
  text:"#F0EFF8", textMid:"#9898B0", textDim:"#5A5A72",
};

const TAGS = {
  "仕事":        { bg:"#7C6AF720", color:"#A89BFF", dot:"#7C6AF7" },
  "プライベート": { bg:"#4ECBA015", color:"#4ECBA0", dot:"#4ECBA0" },
  "健康":        { bg:"#F5C84215", color:"#F5C842", dot:"#F5C842" },
  "家事":        { bg:"#F27B7B15", color:"#F27B7B", dot:"#F27B7B" },
};

const INIT_TASKS = [
  { id:1, title:"旅行の準備",        cat:"プライベート", due:"4/10", done:false, today:false },
  { id:2, title:"週報提出",          cat:"仕事",        due:"4/4",  done:false, today:true  },
  { id:3, title:"請求書確認",        cat:"仕事",        due:"4/4",  done:true,  today:true  },
  { id:4, title:"薬の補充",          cat:"健康",        due:"4/7",  done:false, today:false },
  { id:5, title:"部屋の掃除",        cat:"家事",        due:"4/6",  done:false, today:false },
  { id:6, title:"チームMTG資料作成", cat:"仕事",        due:"4/5",  done:false, today:false },
];

const SCHEDULE = [
  { id:"s1", time:"10:00", title:"チームMTG",        color:"#7C6AF7", duration:"10:00-11:30" },
  { id:"s2", time:"14:00", title:"訪問支援 田中さん", color:"#4ECBA0", duration:"14:00-15:00" },
  { id:"s3", time:"17:30", title:"月次報告",          color:"#F5C842", duration:"17:30-18:00" },
];

const MEMOS = [
  { id:1, title:"旅行メモ",      body:"・新幹線は早割で予約\n・ホテルはチェックアウト11時\n・現金を用意しておく", cat:"プライベート", date:"4/3" },
  { id:2, title:"MTGアジェンダ", body:"Q1振り返り、Q2目標設定、人員配置について",                              cat:"仕事",         date:"4/2" },
];

const SPLIT_PROPOSALS = {
  "旅行の準備":        ["ホテルを予約する","交通手段を確認する","持ち物リストを作成","旅行保険を確認する","現金を準備する"],
  "チームMTG":         ["アジェンダを作成する","資料をSlackに共有","議事録テンプレを準備"],
  "訪問支援 田中さん": ["支援記録を確認する","必要書類を準備する","移動ルートを確認"],
  "月次報告":          ["データを集計する","スライドを更新する","上長に事前共有する"],
  "default":           ["手順①を確認する","手順②を実行する","結果を記録する"],
};

const CATS = ["仕事","プライベート","健康","家事"];

// ── 共通 ─────────────────────────────────────────────

const TagBadge = ({ label }) => {
  const s = TAGS[label] || { bg:"#2E2E3E", color:"#9898B0", dot:"#5A5A72" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      padding:"2px 8px", borderRadius:20, background:s.bg, color:s.color,
      fontSize:11, fontWeight:600 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot }} />
      {label}
    </span>
  );
};

const SLabel = ({ children }) => (
  <div style={{ color:C.textMid, fontSize:11, fontWeight:700,
    letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
    {children}
  </div>
);

const AiBtn = ({ onClick }) => (
  <button onClick={e => { e.stopPropagation(); onClick(); }} style={{
    display:"inline-flex", alignItems:"center", gap:4,
    padding:"4px 10px", borderRadius:20,
    background:"#7C6AF720", border:"1px solid #7C6AF750",
    color:C.accent, fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0,
  }}>✦ AI分割</button>
);

// ── AI分割モーダル ────────────────────────────────────

const AIModal = ({ title, onClose }) => {
  const proposals = SPLIT_PROPOSALS[title] || SPLIT_PROPOSALS["default"];
  const [step, setStep]     = useState("idle");
  const [checks, setChecks] = useState(proposals.map(() => true));

  return (
    <div onClick={onClose} style={{
      position:"absolute", inset:0, background:"rgba(0,0,0,.75)",
      display:"flex", alignItems:"flex-end", zIndex:200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:C.surface, borderRadius:"20px 20px 0 0",
        padding:"20px 20px 36px", width:"100%",
        border:`1px solid ${C.border}`, maxHeight:"80vh", overflowY:"auto",
      }}>
        <div style={{ width:36, height:4, borderRadius:2, background:C.border, margin:"0 auto 16px" }} />
        <div style={{ color:C.textDim, fontSize:11, marginBottom:4 }}>AI分割</div>
        <div style={{ color:C.text, fontSize:17, fontWeight:700, marginBottom:16 }}>「{title}」を分解する</div>

        {step === "idle" && (
          <button onClick={() => { setStep("loading"); setTimeout(() => setStep("result"), 1800); }}
            style={{ width:"100%", padding:"13px", borderRadius:14,
              background:"linear-gradient(135deg,#7C6AF7,#A89BFF)",
              color:"#fff", fontSize:15, fontWeight:700, border:"none", cursor:"pointer" }}>
            ✦ AIで分割する
          </button>
        )}
        {step === "loading" && (
          <div style={{ textAlign:"center", padding:"24px 0", color:C.textMid, fontSize:14 }}>✨ AIが考え中…</div>
        )}
        {step === "result" && (
          <>
            <div style={{ color:C.textDim, fontSize:11, marginBottom:10 }}>タップで取捨選択</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {proposals.map((p, i) => (
                <div key={i} onClick={() => setChecks(c => c.map((v,j) => j===i?!v:v))} style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:checks[i] ? C.surface : C.surfaceHigh,
                  border:`1px solid ${checks[i] ? C.accent+"60" : C.border}`,
                  borderRadius:12, padding:"10px 14px", cursor:"pointer",
                  opacity:checks[i] ? 1 : 0.4, transition:"all .15s",
                }}>
                  <div style={{
                    width:18, height:18, borderRadius:5, flexShrink:0,
                    border:`2px solid ${checks[i] ? C.accent : C.border}`,
                    background:checks[i] ? C.accent : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {checks[i] && <span style={{ color:"#fff", fontSize:10, fontWeight:900 }}>✓</span>}
                  </div>
                  <div style={{ color:C.text, fontSize:13 }}>{p}</div>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{
              width:"100%", padding:"13px", borderRadius:14,
              background:"linear-gradient(135deg,#4ECBA0,#6EDBB8)",
              color:"#fff", fontSize:15, fontWeight:700, border:"none", cursor:"pointer",
            }}>
              Google Tasksに保存 ({checks.filter(Boolean).length}件)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── ドラッグ可能タスクカード ──────────────────────────

const DraggableTaskCard = ({ task, onDragStart, onToggleDone, onAI }) => {
  const s = TAGS[task.cat] || {};
  const cardRef = useRef(null);

  const handlePointerDown = e => {
    e.preventDefault();
    onDragStart(task, e);
  };

  return (
    <div
      ref={cardRef}
      style={{
        background: C.surface, borderRadius:13,
        border:`1px solid ${C.border}`,
        padding:"10px 12px",
        opacity: task.done ? 0.45 : 1,
        display:"flex", alignItems:"center", gap:8,
        userSelect:"none", touchAction:"none",
        cursor:"grab",
      }}
    >
      {/* ドラッグハンドル */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          display:"flex", flexDirection:"column", gap:3,
          padding:"4px 2px", cursor:"grab", flexShrink:0,
        }}
      >
        {[0,1,2].map(i => (
          <div key={i} style={{ display:"flex", gap:3 }}>
            <div style={{ width:3, height:3, borderRadius:"50%", background:C.textDim }} />
            <div style={{ width:3, height:3, borderRadius:"50%", background:C.textDim }} />
          </div>
        ))}
      </div>

      {/* チェックボックス */}
      <button onClick={() => onToggleDone(task.id)} style={{
        width:18, height:18, borderRadius:5, flexShrink:0,
        border:`2px solid ${task.done ? C.green : C.border}`,
        background:task.done ? C.green : "transparent",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {task.done && <span style={{ color:"#000", fontSize:9, fontWeight:900 }}>✓</span>}
      </button>

      {/* タイトル */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          color:C.text, fontSize:13, fontWeight:600,
          textDecoration:task.done?"line-through":"none",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>{task.title}</div>
        <div style={{ display:"flex", gap:4, marginTop:4, alignItems:"center" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:3,
            padding:"1px 6px", borderRadius:10,
            background:s.bg||"#2E2E3E", color:s.color||C.textDim, fontSize:10, fontWeight:600,
          }}>
            <span style={{ width:4, height:4, borderRadius:"50%", background:s.dot||C.textDim }} />
            {task.cat}
          </span>
          {task.due && <span style={{ color:C.textDim, fontSize:10 }}>〆{task.due}</span>}
        </div>
      </div>

      {!task.done && <AiBtn onClick={() => onAI(task.title)} />}
    </div>
  );
};

// ── カテゴリドロップゾーン ────────────────────────────

const CategoryZone = ({ cat, tasks, dragOverCat, onToggleDone, onAI }) => {
  const s = TAGS[cat];
  const isOver = dragOverCat === cat;
  const activeTasks = tasks.filter(t => !t.done);
  const doneTasks   = tasks.filter(t => t.done);

  return (
    <div style={{
      borderRadius:14,
      border:`2px solid ${isOver ? s.dot : C.border}`,
      background: isOver ? s.bg : C.surface,
      transition:"all .15s", overflow:"hidden",
    }}>
      {/* ヘッダー */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 14px",
        borderBottom: tasks.length > 0 ? `1px solid ${C.border}` : "none",
        background: isOver ? s.bg : "transparent",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:s.dot }} />
          <span style={{ color:C.text, fontSize:13, fontWeight:700 }}>{cat}</span>
          {activeTasks.length > 0 && (
            <span style={{ background:s.bg, color:s.color,
              fontSize:11, padding:"1px 7px", borderRadius:10, fontWeight:600 }}>
              {activeTasks.length}
            </span>
          )}
        </div>
        {isOver && (
          <span style={{ color:s.color, fontSize:11, fontWeight:700 }}>ここにドロップ ↓</span>
        )}
      </div>

      {/* タスク一覧 */}
      {tasks.length > 0 && (
        <div style={{ padding:"8px", display:"flex", flexDirection:"column", gap:6 }}>
          {activeTasks.map(t => (
            <div key={t.id} style={{
              background:C.surfaceHigh, borderRadius:10,
              border:`1px solid ${C.border}`, padding:"8px 10px",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <button onClick={() => onToggleDone(t.id)} style={{
                width:16, height:16, borderRadius:4, flexShrink:0,
                border:`2px solid ${C.border}`, background:"transparent",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              }} />
              <div style={{ flex:1, color:C.text, fontSize:12, fontWeight:500,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {t.title}
              </div>
              <AiBtn onClick={() => onAI(t.title)} />
            </div>
          ))}
          {doneTasks.map(t => (
            <div key={t.id} style={{
              background:"transparent", borderRadius:10,
              padding:"6px 10px",
              display:"flex", alignItems:"center", gap:8, opacity:0.4,
            }}>
              <div style={{ width:16, height:16, borderRadius:4, flexShrink:0,
                background:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#000", fontSize:9, fontWeight:900 }}>✓</span>
              </div>
              <div style={{ color:C.text, fontSize:12, textDecoration:"line-through" }}>{t.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* 空の場合のヒント */}
      {tasks.length === 0 && (
        <div style={{ padding:"12px 14px", color:C.textDim, fontSize:12,
          textAlign:"center", borderStyle:"dashed" }}>
          {isOver ? "ここに移動する" : "タスクをドラッグ"}
        </div>
      )}
    </div>
  );
};

// ── タスク画面 ────────────────────────────────────────

const TaskScreen = ({ tasks, setTasks }) => {
  const [aiTarget,    setAiTarget]    = useState(null);
  const [dragTask,    setDragTask]    = useState(null);
  const [dragOverCat, setDragOverCat] = useState(null);
  const [ghostPos,    setGhostPos]    = useState({ x:0, y:0 });
  const [isDragging,  setIsDragging]  = useState(false);
  const catRefs = useRef({});
  const containerRef = useRef(null);

  const toggleDone = id => setTasks(ts => ts.map(t => t.id===id ? {...t, done:!t.done} : t));

  // ── ドラッグ開始 ──
  const handleDragStart = (task, e) => {
    setDragTask(task);
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setGhostPos({ x: clientX - 80, y: clientY - 20 });
  };

  // ── ドラッグ移動 ──
  useEffect(() => {
    if (!isDragging) return;

    const onMove = e => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setGhostPos({ x: clientX - 80, y: clientY - 20 });

      // どのカテゴリの上にいるか判定
      let found = null;
      for (const cat of CATS) {
        const el = catRefs.current[cat];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top  && clientY <= rect.bottom) {
          found = cat;
          break;
        }
      }
      setDragOverCat(found);
    };

    const onEnd = () => {
      if (dragTask && dragOverCat && dragOverCat !== dragTask.cat) {
        setTasks(ts => ts.map(t => t.id === dragTask.id ? { ...t, cat: dragOverCat } : t));
      }
      setDragTask(null);
      setDragOverCat(null);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onEnd);
    };
  }, [isDragging, dragTask, dragOverCat]);

  const todayTasks = tasks.filter(t => t.today);

  return (
    <div ref={containerRef} style={{ padding:"0 0 80px", position:"relative" }}>
      <div style={{ padding:"24px 20px 12px" }}>
        <div style={{ color:C.textDim, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>タスク</div>
        <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>やること一覧</div>
      </div>

      {/* ① 今日やること */}
      <div style={{ margin:"0 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <SLabel>① 今日やること</SLabel>
          <span style={{ background:C.accentSoft, color:C.accent, fontSize:11, fontWeight:700,
            padding:"2px 8px", borderRadius:20, marginBottom:10 }}>
            {todayTasks.filter(t=>!t.done).length} 件
          </span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {todayTasks.map(t => (
            <DraggableTaskCard
              key={t.id} task={t}
              onDragStart={handleDragStart}
              onToggleDone={toggleDone}
              onAI={setAiTarget}
            />
          ))}
        </div>
      </div>

      {/* ② カテゴリ別（ドロップゾーン） */}
      <div style={{ margin:"0 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <SLabel>② カテゴリ別やること</SLabel>
          {isDragging && (
            <span style={{ color:C.accent, fontSize:11, fontWeight:700,
              background:C.accentSoft, padding:"2px 8px", borderRadius:20, marginBottom:10 }}>
              ドロップして移動
            </span>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {CATS.map(cat => (
            <div key={cat} ref={el => catRefs.current[cat] = el}>
              <CategoryZone
                cat={cat}
                tasks={tasks.filter(t => !t.today && t.cat === cat)}
                dragOverCat={dragOverCat}
                onToggleDone={toggleDone}
                onAI={setAiTarget}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ③ 今日の予定（カレンダーから） */}
      <div style={{ margin:"0 20px 24px" }}>
        <SLabel>③ 今日の予定</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {SCHEDULE.map(s => (
            <div key={s.id} style={{ background:C.surface, borderRadius:14,
              border:`1px solid ${C.border}`, padding:"12px 14px",
              display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:3, height:36, borderRadius:2, background:s.color, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{s.title}</div>
                <div style={{ color:C.textDim, fontSize:12, marginTop:2 }}>{s.duration}</div>
              </div>
              <AiBtn onClick={() => setAiTarget(s.title)} />
            </div>
          ))}
        </div>
      </div>

      {/* ドラッグゴースト */}
      {isDragging && dragTask && (
        <div style={{
          position:"fixed",
          left: ghostPos.x, top: ghostPos.y,
          pointerEvents:"none", zIndex:999,
          background:C.surface,
          border:`2px solid ${C.accent}`,
          borderRadius:12, padding:"8px 14px",
          boxShadow:`0 8px 32px rgba(124,106,247,.4)`,
          maxWidth:200, opacity:0.95,
          transform:"rotate(-2deg)",
        }}>
          <div style={{ color:C.text, fontSize:13, fontWeight:600 }}>{dragTask.title}</div>
          <div style={{ color:C.accent, fontSize:11, marginTop:2 }}>{dragTask.cat}</div>
        </div>
      )}

      {/* AI分割モーダル */}
      {aiTarget && <AIModal title={aiTarget} onClose={() => setAiTarget(null)} />}
    </div>
  );
};

// ── ホーム画面 ────────────────────────────────────────

const HomeScreen = ({ tasks }) => {
  const today    = tasks.filter(t => t.today && !t.done);
  const upcoming = tasks.filter(t => !t.today && !t.done).slice(0, 3);

  return (
    <div style={{ padding:"0 0 80px" }}>
      <div style={{ padding:"24px 20px 12px" }}>
        <div style={{ color:C.textDim, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>
          2026年4月4日（土）
        </div>
        <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>おはようございます 👋</div>
      </div>

      <div style={{ margin:"0 20px" }}>
        <SLabel>今日のスケジュール</SLabel>
        <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          {SCHEDULE.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px",
              borderBottom:i<SCHEDULE.length-1?`1px solid ${C.border}`:"none" }}>
              <div style={{ width:3, height:28, borderRadius:2, background:s.color, flexShrink:0 }} />
              <div style={{ color:C.textMid, fontSize:12, fontWeight:600, minWidth:44 }}>{s.time}</div>
              <div style={{ color:C.text, fontSize:13, fontWeight:500 }}>{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin:"20px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <SLabel>今日やること</SLabel>
          <span style={{ background:C.accentSoft, color:C.accent, fontSize:11, fontWeight:700,
            padding:"2px 8px", borderRadius:20, marginBottom:10 }}>
            {today.length} 件残り
          </span>
        </div>
        {today.length === 0
          ? <div style={{ color:C.textDim, fontSize:13, textAlign:"center", padding:"20px 0" }}>すべて完了！🎉</div>
          : today.map(t => (
            <div key={t.id} style={{ background:C.surface, borderRadius:14,
              border:`1px solid ${C.border}`, padding:"11px 14px", marginBottom:8,
              display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${C.border}` }} />
              <div style={{ flex:1, color:C.text, fontSize:14, fontWeight:600 }}>{t.title}</div>
              <div style={{ color:C.textDim, fontSize:11 }}>〆{t.due}</div>
            </div>
          ))
        }
      </div>

      <div style={{ margin:"20px 20px 0" }}>
        <SLabel>直近のタスク</SLabel>
        {upcoming.map(t => (
          <div key={t.id} style={{ background:C.surface, borderRadius:14,
            border:`1px solid ${C.border}`, padding:"11px 14px", marginBottom:8,
            display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:C.text, fontSize:14, fontWeight:600 }}>{t.title}</div>
              <div style={{ marginTop:5 }}><TagBadge label={t.cat} /></div>
            </div>
            <div style={{ color:C.textDim, fontSize:11 }}>〆{t.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── カレンダー画面 ────────────────────────────────────

const CalendarScreen = () => {
  const [sel, setSel] = useState(4);
  const week = [{d:1,day:"月"},{d:2,day:"火"},{d:3,day:"水"},{d:4,day:"木"},{d:5,day:"金"},{d:6,day:"土"},{d:7,day:"日"}];
  const dots = { 4:["#7C6AF7","#4ECBA0"], 5:["#F5C842"], 6:["#4ECBA0","#F27B7B"] };
  const times = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  return (
    <div style={{ padding:"0 0 80px" }}>
      <div style={{ padding:"24px 20px 12px" }}>
        <div style={{ color:C.textDim, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>カレンダー</div>
        <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>2026年 4月</div>
      </div>
      <div style={{ margin:"0 20px 20px" }}>
        <div style={{ display:"flex", gap:4 }}>
          {week.map(({d,day}) => (
            <div key={d} onClick={() => setSel(d)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              padding:"8px 0", borderRadius:12, cursor:"pointer",
              background:sel===d ? C.accent : "transparent", transition:"background .15s",
            }}>
              <div style={{ color:sel===d?"#fff":C.textDim, fontSize:10, fontWeight:600, marginBottom:4 }}>{day}</div>
              <div style={{ color:sel===d?"#fff":C.text, fontSize:15, fontWeight:700 }}>{d}</div>
              <div style={{ display:"flex", gap:2, marginTop:4 }}>
                {(dots[d]||[]).map((c,i) => (
                  <div key={i} style={{ width:4, height:4, borderRadius:"50%",
                    background:sel===d?"rgba(255,255,255,.6)":c }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin:"0 20px" }}>
        <SLabel>4月{sel}日のタイムライン</SLabel>
        <div style={{ position:"relative", paddingLeft:52 }}>
          {times.map((t,i) => (
            <div key={t} style={{ display:"flex", alignItems:"flex-start", minHeight:44, position:"relative" }}>
              <div style={{ position:"absolute", left:-52, top:2,
                color:C.textDim, fontSize:10, fontWeight:600, width:44, textAlign:"right" }}>{t}</div>
              <div style={{ position:"absolute", left:-5, top:10, width:1, bottom:-10, background:C.border }} />
              <div style={{ position:"absolute", left:-8, top:8, width:6, height:6, borderRadius:"50%",
                background:i===1?C.accent:i===5?C.green:i===8?C.yellow:C.border }} />
              {i===1 && sel===4 && (
                <div style={{ background:"#7C6AF720", border:"1px solid #7C6AF740",
                  borderRadius:10, padding:"8px 12px", marginLeft:8, flex:1 }}>
                  <div style={{ color:C.accent, fontSize:13, fontWeight:700 }}>チームMTG</div>
                  <div style={{ color:C.textDim, fontSize:11 }}>10:00 - 11:30</div>
                </div>
              )}
              {i===5 && sel===4 && (
                <div style={{ background:C.greenSoft, border:`1px solid ${C.green}30`,
                  borderRadius:10, padding:"8px 12px", marginLeft:8, flex:1 }}>
                  <div style={{ color:C.green, fontSize:13, fontWeight:700 }}>訪問支援 田中さん</div>
                  <div style={{ color:C.textDim, fontSize:11 }}>14:00 - 15:00</div>
                </div>
              )}
              {i===8 && sel===4 && (
                <div style={{ background:"#F5C84215", border:"1px solid #F5C84230",
                  borderRadius:10, padding:"8px 12px", marginLeft:8, flex:1 }}>
                  <div style={{ color:C.yellow, fontSize:13, fontWeight:700 }}>月次報告</div>
                  <div style={{ color:C.textDim, fontSize:11 }}>17:30 - 18:00</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── メモ画面 ─────────────────────────────────────────

const MemoScreen = () => {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ padding:"0 0 80px" }}>
      <div style={{ padding:"24px 20px 12px" }}>
        <div style={{ color:C.textDim, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>メモ</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>ノート</div>
          <button style={{ width:36, height:36, borderRadius:10,
            background:"#7C6AF720", border:"1px solid #7C6AF740",
            color:C.accent, fontSize:20, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        </div>
      </div>
      <div style={{ margin:"0 20px", display:"flex", flexDirection:"column", gap:10 }}>
        {MEMOS.map(m => (
          <div key={m.id} onClick={() => setSel(sel===m.id?null:m.id)} style={{
            background:C.surface, borderRadius:16,
            border:`1px solid ${sel===m.id ? C.accent+"60" : C.border}`,
            padding:"14px 16px", cursor:"pointer", transition:"all .15s",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ color:C.text, fontSize:15, fontWeight:700 }}>{m.title}</div>
              <div style={{ color:C.textDim, fontSize:11 }}>{m.date}</div>
            </div>
            <div style={{ color:C.textMid, fontSize:13, lineHeight:1.6,
              maxHeight:sel===m.id?"none":38, overflow:"hidden", whiteSpace:"pre-line" }}>
              {m.body}
            </div>
            <div style={{ marginTop:8 }}><TagBadge label={m.cat} /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── メインApp ─────────────────────────────────────────

const NAV = [
  { id:"home",     label:"ホーム",     icon:"🏠" },
  { id:"tasks",    label:"タスク",     icon:"✅" },
  { id:"calendar", label:"カレンダー", icon:"📅" },
  { id:"memo",     label:"メモ",       icon:"📝" },
];

export default function App() {
  const [tab,   setTab]   = useState("tasks");
  const [tasks, setTasks] = useState(INIT_TASKS);

  const screens = {
    home:     <HomeScreen tasks={tasks} />,
    tasks:    <TaskScreen tasks={tasks} setTasks={setTasks} />,
    calendar: <CalendarScreen />,
    memo:     <MemoScreen />,
  };

  return (
    <div style={{
      width:"100%", maxWidth:390, margin:"0 auto",
      height:"100vh", background:C.bg,
      fontFamily:"'Noto Sans JP','Helvetica Neue',sans-serif",
      color:C.text, position:"relative", overflow:"hidden",
      display:"flex", flexDirection:"column",
    }}>
      <div style={{ flex:1, overflowY:"auto" }}>{screens[tab]}</div>
      <div style={{ background:C.surface, borderTop:`1px solid ${C.border}`,
        display:"flex", padding:"8px 0" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center",
            gap:3, background:"none", border:"none", cursor:"pointer", padding:"4px 0",
          }}>
            <div style={{ fontSize:18, lineHeight:1,
              color:tab===n.id ? C.accent : C.textDim }}>{n.icon}</div>
            <div style={{ fontSize:10, fontWeight:tab===n.id?700:400,
              color:tab===n.id ? C.accent : C.textDim }}>{n.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { C } from '../constants';
import type { Memo } from '../types';

interface Props {
  memos: Memo[];
  loading: boolean;
  onAdd: (text: string) => Promise<void>;
}

const MemoScreen = ({ memos, loading, onAdd }: Props) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAdd(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>メモ</div>

      {/* 入力エリア */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メモを入力..."
          rows={3}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: C.text,
            fontSize: 14,
            resize: 'none',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            style={{
              background: text.trim() && !submitting ? C.accent : C.border,
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              color: C.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: text.trim() && !submitting ? 'pointer' : 'default',
            }}
          >
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* メモ一覧 */}
      {loading && <div style={{ color: C.textMid, textAlign: 'center', padding: 32 }}>読み込み中...</div>}

      {!loading && memos.length === 0 && (
        <div style={{ color: C.textDim, fontSize: 13, textAlign: 'center', padding: 32 }}>メモがありません</div>
      )}

      {memos.map((memo, i) => (
        <div
          key={i}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 10,
          }}
        >
          <div style={{ color: C.textDim, fontSize: 11, marginBottom: 6 }}>{memo.datetime}</div>
          <div style={{ color: C.text, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{memo.text}</div>
        </div>
      ))}
    </div>
  );
};

export default MemoScreen;

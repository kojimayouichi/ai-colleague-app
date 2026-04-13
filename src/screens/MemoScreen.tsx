import { useState } from 'react';
import { C } from '../constants';
import type { Memo } from '../types';

interface Props {
  memos: Memo[];
  loading: boolean;
  onAdd: (text: string) => Promise<void>;
  onEdit: (rowIndex: number, text: string) => Promise<void>;
  onDelete: (rowIndex: number) => Promise<void>;
  onMemorize: (text: string) => Promise<void>;
}

const MemoScreen = ({ memos, loading, onAdd, onEdit, onDelete, onMemorize }: Props) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [memorizingIndex, setMemorizingIndex] = useState<number | null>(null);
  const [memorizedRows, setMemorizedRows] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState(false);

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

  const handleEditStart = (memo: Memo) => {
    setEditingIndex(memo.rowIndex);
    setEditText(memo.text);
  };

  const handleEditSave = async (rowIndex: number) => {
    if (!editText.trim()) return;
    await onEdit(rowIndex, editText.trim());
    setEditingIndex(null);
  };

  const handleMemorize = async (rowIndex: number, text: string) => {
    setMemorizingIndex(rowIndex);
    try {
      await onMemorize(text);
      setMemorizedRows((prev) => { const next = new Set(prev); next.add(rowIndex); return next; });
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } finally {
      setMemorizingIndex(null);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    setDeletingIndex(rowIndex);
    try {
      await onDelete(rowIndex);
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <div style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>メモ</div>

      {/* トースト通知 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: C.surfaceHigh, border: `1px solid ${C.accent}`, borderRadius: 20,
          padding: '10px 20px', color: C.text, fontSize: 13, fontWeight: 600,
          zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          🤖 中期記憶に追加しました
        </div>
      )}

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

      {memos.map((memo) => (
        <div
          key={memo.rowIndex}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ color: C.textDim, fontSize: 11 }}>{memo.datetime}</div>
            {editingIndex !== memo.rowIndex && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleMemorize(memo.rowIndex, memo.text)}
                  disabled={memorizingIndex === memo.rowIndex || memorizedRows.has(memo.rowIndex)}
                  title={memorizedRows.has(memo.rowIndex) ? '記憶済み' : '中期記憶に保存'}
                  style={{ background: 'none', border: 'none', color: C.textMid, cursor: memorizedRows.has(memo.rowIndex) ? 'default' : 'pointer', fontSize: 14, padding: '2px 4px', opacity: (memorizingIndex === memo.rowIndex || memorizedRows.has(memo.rowIndex)) ? 0.2 : 1 }}
                >
                  🤖
                </button>
                <button
                  onClick={() => handleEditStart(memo)}
                  style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 14, padding: '2px 4px' }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(memo.rowIndex)}
                  disabled={deletingIndex === memo.rowIndex}
                  style={{ background: 'none', border: 'none', color: C.textMid, cursor: 'pointer', fontSize: 14, padding: '2px 4px', opacity: deletingIndex === memo.rowIndex ? 0.4 : 1 }}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {editingIndex === memo.rowIndex ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                autoFocus
                style={{
                  width: '100%',
                  background: C.surfaceHigh,
                  border: `1px solid ${C.accent}`,
                  borderRadius: 8,
                  color: C.text,
                  fontSize: 14,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'system-ui, sans-serif',
                  padding: '8px 10px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={() => setEditingIndex(null)}
                  style={{ background: C.border, border: 'none', borderRadius: 8, padding: '6px 14px', color: C.textMid, fontSize: 12, cursor: 'pointer' }}
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleEditSave(memo.rowIndex)}
                  disabled={!editText.trim()}
                  style={{ background: editText.trim() ? C.accent : C.border, border: 'none', borderRadius: 8, padding: '6px 14px', color: C.text, fontSize: 12, fontWeight: 700, cursor: editText.trim() ? 'pointer' : 'default' }}
                >
                  保存
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: C.text, fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{memo.text}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MemoScreen;

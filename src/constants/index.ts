// カラーデザイントークン（mockup_v3.jsxより）
export const C = {
  bg: '#0F0F13',
  surface: '#1A1A22',
  surfaceHigh: '#22222E',
  border: '#2E2E3E',
  accent: '#7C6AF7',
  accentSoft: '#7C6AF720',
  green: '#4ECBA0',
  greenSoft: '#4ECBA015',
  yellow: '#F5C842',
  red: '#F27B7B',
  text: '#F0EFF8',
  textMid: '#9898B0',
  textDim: '#5A5A72',
} as const;

// カテゴリ定義
export const CATEGORIES = ['仕事', 'プライベート', '子ども', '家事'] as const;
export type Category = typeof CATEGORIES[number];

// カテゴリごとのカラー設定
export const CATEGORY_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  仕事: { bg: '#7C6AF720', color: '#A89BFF', dot: '#7C6AF7' },
  プライベート: { bg: '#4ECBA015', color: '#4ECBA0', dot: '#4ECBA0' },
  子ども: { bg: '#F5C84215', color: '#F5C842', dot: '#F5C842' },
  家事: { bg: '#F27B7B15', color: '#F27B7B', dot: '#F27B7B' },
  未分類: { bg: '#2E2E3E', color: '#9898B0', dot: '#5A5A72' },
};

// スプレッドシート
export const SPREADSHEET_ID = '1teWdFNrADMFHsZYXlF5stvOVqwWj_S07DWWtn8W2jt8';

// Google API スコープ
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

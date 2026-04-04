import { GOOGLE_SCOPES } from '../constants';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// アクセストークンをメモリ内に保持
let accessToken: string | null = null;

// リダイレクト先URI（Google Cloud Consoleに登録したものと完全一致させる）
const REDIRECT_URI = import.meta.env.DEV
  ? 'http://localhost:5173/'
  : 'https://kojimayouichi.github.io/ai-colleague-app/';

// Googleの認可画面にリダイレクト
export const redirectToSignIn = (): void => {
  console.log('[Auth] REDIRECT_URI:', REDIRECT_URI);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: GOOGLE_SCOPES,
    prompt: 'select_account',
  });
  window.location.href = `${AUTH_URL}?${params}`;
};

// リダイレクト後のURLハッシュからトークンを取り出す
export const parseTokenFromHash = (): string | null => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
};

// URLからトークンを消去（履歴に残さない）
export const clearTokenFromUrl = (): void => {
  window.history.replaceState(null, '', window.location.pathname);
};

// トークンをセット
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

// トークンを取得
export const getAccessToken = (): string | null => accessToken;

// サインアウト
export const signOut = (): void => {
  accessToken = null;
};

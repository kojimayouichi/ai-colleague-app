import { GOOGLE_SCOPES } from '../constants';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string;
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const STORAGE_KEY = 'gauth_token';

const REDIRECT_URI = import.meta.env.DEV
  ? 'http://localhost:5173/'
  : 'https://kojimayouichi.github.io/ai-colleague-app/';

// ── トークン永続化 ───────────────────────────────────────

interface StoredToken {
  access_token: string;
  expires_at: number; // UNIXタイムスタンプ（ms）
}

const saveToken = (token: string, expiresIn: number) => {
  const stored: StoredToken = {
    access_token: token,
    expires_at: Date.now() + expiresIn * 1000 - 60_000, // 1分早めに期限切れ扱い
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

// 保存済みの有効なトークンを返す（期限切れならnull）
export const loadStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored: StoredToken = JSON.parse(raw);
    if (Date.now() > stored.expires_at) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored.access_token;
  } catch {
    return null;
  }
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// ── PKCE ヘルパー ────────────────────────────────────────

const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// ── 認証フロー ───────────────────────────────────────────

// Step 1: Googleの認証ページへリダイレクト
export const redirectToSignIn = async (): Promise<void> => {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem('pkce_verifier', verifier);

  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
    access_type: 'online',
  });

  window.location.href = `${AUTH_URL}?${params}`;
};

// Step 2: リダイレクト後に認証コードをトークンに交換してlocalStorageに保存
export const exchangeCodeForToken = async (): Promise<string | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    console.error('[Auth] OAuth error:', error);
    window.history.replaceState(null, '', window.location.pathname);
    return null;
  }
  if (!code) return null;

  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) {
    console.error('[Auth] code_verifier が見つかりません');
    return null;
  }

  window.history.replaceState(null, '', window.location.pathname);
  sessionStorage.removeItem('pkce_verifier');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('[Auth] トークン交換失敗:', err);
    return null;
  }

  const data = await res.json();
  saveToken(data.access_token, data.expires_in ?? 3600);
  return data.access_token;
};

export const getAccessToken = (): string | null => loadStoredToken();

export const signOut = (): void => {
  clearStoredToken();
};

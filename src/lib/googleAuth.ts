import { GOOGLE_SCOPES } from '../constants';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// アクセストークンをメモリ内に保持（localStorageには保存しない）
let accessToken: string | null = null;

// Google Identity Services の TokenClient
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

// GSI スクリプトの読み込みを待つ
const waitForGSI = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

// TokenClient を初期化して認可フローを開始する
export const signIn = (): Promise<string> =>
  new Promise(async (resolve, reject) => {
    await waitForGSI();

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        accessToken = response.access_token;
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });

// アクセストークンを取得する（未認証なら null）
export const getAccessToken = (): string | null => accessToken;

// サインアウト
export const signOut = (): void => {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null;
  }
};

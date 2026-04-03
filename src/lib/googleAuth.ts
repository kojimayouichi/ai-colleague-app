import { GOOGLE_SCOPES } from '../constants';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// アクセストークンをメモリ内に保持（localStorageには保存しない）
let accessToken: string | null = null;

// GSI が window.google に読み込まれるまでポーリングで待つ
const waitForGSI = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });

// TokenClient を初期化して認可フローを開始する
export const signIn = (): Promise<string> =>
  new Promise((resolve, reject) => {
    waitForGSI().then(() => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
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

      tokenClient.requestAccessToken({ prompt: '' });
    });
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

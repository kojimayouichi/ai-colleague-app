import { GOOGLE_SCOPES } from '../constants';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

let accessToken: string | null = null;

const waitForGSI = (): Promise<void> =>
  new Promise((resolve) => {
    console.log('[Auth] waitForGSI 開始');
    if (window.google?.accounts?.oauth2) {
      console.log('[Auth] GSI すでに読み込み済み');
      resolve();
      return;
    }
    console.log('[Auth] GSI 読み込み待機中...');
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        console.log('[Auth] GSI 読み込み完了');
        resolve();
      }
    }, 100);
  });

export const signIn = (): Promise<string> =>
  new Promise((resolve, reject) => {
    console.log('[Auth] signIn 開始, CLIENT_ID:', CLIENT_ID ? '設定済み' : '未設定');
    waitForGSI().then(() => {
      console.log('[Auth] initTokenClient 実行');
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (response) => {
          console.log('[Auth] callback 受信:', response);
          if (response.error) {
            console.error('[Auth] エラー:', response.error, response.error_description);
            reject(new Error(response.error));
            return;
          }
          console.log('[Auth] トークン取得成功');
          accessToken = response.access_token;
          resolve(response.access_token);
        },
        error_callback: (error: { type: string }) => {
          console.error('[Auth] error_callback:', error);
          reject(new Error(error.type));
        },
      });

      console.log('[Auth] requestAccessToken 実行');
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      console.log('[Auth] requestAccessToken 呼び出し完了（ポップアップ待機中）');
    });
  });

export const getAccessToken = (): string | null => accessToken;

export const signOut = (): void => {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null;
  }
};

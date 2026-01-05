// src/lib/authUtils.ts

let _onTokenRefreshFailed: (() => Promise<void>) | null = null;

export const setOnTokenRefreshFailed = (callback: () => Promise<void>) => {
  _onTokenRefreshFailed = callback;
};

export const triggerTokenRefreshFailed = async () => {
  if (_onTokenRefreshFailed) {
    await _onTokenRefreshFailed();
  }
};
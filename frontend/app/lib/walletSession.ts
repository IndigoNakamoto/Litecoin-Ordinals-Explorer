export const WALLET_SESSION_EVENT = 'ordlite-wallet-session-change';

export interface StoredWalletSession {
  connected: boolean;
  provider: string;
  username: string;
  balance: string;
  total: string;
}

export const defaultWalletSession: StoredWalletSession = {
  connected: false,
  provider: '',
  username: '',
  balance: '0',
  total: '0',
};

export const getStoredWalletSession = (): StoredWalletSession => {
  if (typeof window === 'undefined') {
    return defaultWalletSession;
  }

  return {
    connected: localStorage.getItem('connected') === 'true',
    provider: localStorage.getItem('provider') ?? '',
    username: localStorage.getItem('username') ?? '',
    balance: localStorage.getItem('balance') ?? '0',
    total: localStorage.getItem('total') ?? '0',
  };
};

export const notifyWalletSessionChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WALLET_SESSION_EVENT));
  }
};

export const clearWalletSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('connected', 'false');
  localStorage.setItem('provider', '');
  localStorage.setItem('inscriptions', JSON.stringify([]));
  localStorage.setItem('balance', '0');
  localStorage.setItem('address', '');
  localStorage.setItem('total', '0');
  localStorage.setItem('username', '');
  localStorage.setItem('publicKey', '');
  notifyWalletSessionChanged();
};

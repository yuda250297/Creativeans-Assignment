import { create } from 'zustand';
import { authCookies } from '@/lib/cookies';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    authCookies.setToken(token);
    set({
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    authCookies.removeToken();
    set({
      token: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: () => {
    const token = authCookies.getToken();
    if (token) {
      set({
        token,
        isAuthenticated: true,
      });
    }
  },
}));

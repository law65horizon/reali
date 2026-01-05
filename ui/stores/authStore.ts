
// stores/authStore.js (Zustand)

import { LOGOUT } from '@/graphql/mutations';
import { client } from '@/lib/apolloClient';
import { setOnTokenRefreshFailed } from '@/lib/authUtils';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

type mode = 'guest' | 'host'

interface AuthStore {
    user: any;
    accessToken: any
    refreshToken: any
    isAuthenticated: boolean
    isLoading: boolean
    mode: string
    
    setAuth: (accessToken: string, refreshToken: string, user: any, mode: mode) => void
    clearAuth: () => void
    loadAuth: () => void;
    updateUser: (user: any) => void
    switchMode: (mode: mode) => void

}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  mode: 'guest',

  // Actions
  setAuth: async (accessToken, refreshToken, user, mode) => {
    // console.log({sid: "sosi"})
    // console.log({user: typeof mode})
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      await SecureStore.setItemAsync('mode', mode);
      
      set({ 
        user, 
        accessToken, 
        refreshToken,
        isAuthenticated: true, 
        isLoading: false, 
        mode
      });
    } catch (error) {
      console.error('Failed to set auth:', error);
    }
  },

  switchMode: async (mode) => {
    try {
      await SecureStore.setItem('mode', mode)
      console.log({mode})
      set({mode})
    } catch (error) {
      console.log('Failed to switch mode', error)
    }
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('mode');
      
      // Clear Apollo cache
      await client.clearStore();
      
      set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null,
        isAuthenticated: false, 
        isLoading: false,
        mode:'guest'
      });
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  },

  loadAuth: async () => {
    try {
      // await SecureStore.setItemAsync('accessToken', '13713516525554b229be85d59eb14ac401d5d92377a6d6fda5bde911e04c481a4d92080491230fdd1588c91c3d2dd5b945a9069dbb056386f773e9ba761461c4');
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');
      const mode = await SecureStore.getItem('mode') || 'guest';

      if (accessToken && refreshToken) {
        const user = null;
        // console.error("siosi")
        // const user = JSON.parse(userStr);
        set({ 
          accessToken: '', 
          refreshToken,
          user,
          isAuthenticated: true, 
          isLoading: false,
          mode: mode
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      set({ isLoading: false });
    }
  },

  updateUser: async (user) => {
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    
    // Call logout mutation if you want to invalidate refresh token on server
    if (refreshToken) {
      try {
        await client.mutate({
          mutation: LOGOUT,
          variables: { refreshToken },
        });
      } catch (error) {
        console.error('Server logout failed:', error);
      }
    }
    
    await get().clearAuth();
  },
}));

setOnTokenRefreshFailed(async () => {
  await useAuthStore.getState().clearAuth()
})
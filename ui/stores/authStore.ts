
// stores/authStore.js (Zustand)

import { LOGOUT } from '@/graphql/mutations';
import { client, setOnAuthStateUpdate } from '@/lib/apolloClient';
import { setOnTokenRefreshFailed } from '@/lib/authUtils';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { create } from 'zustand';

export type userMode = 'guest' | 'host'

const GET_SESSION = gql`
query GetSession($sessionId: String!) {
  getSession(sessionId: $sessionId) {
    session {
      deviceId
      user {
        id
        email
      }
    }
    message
    success
  }
}
`

interface AuthStore {
    user: any;
    sessionId: string;
    accessToken: any
    refreshToken: any
    isAuthenticated: boolean
    isLoading: boolean
    mode: userMode | null
    
    setAuth: (accessToken: string, refreshToken: string, user: any, sessionId: string, mode: userMode) => void
    logout: () => void;
    clearAuth: () => void
    loadAuth: () => void;
    updateUser: (user: any) => void
    switchMode: (mode: userMode) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  sessionId: '',
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  mode: null,

  // Actions
  setAuth: async (accessToken, refreshToken, user, sessionId, mode) => {
    // console.log({sid: "sosi"})
    console.log({accessToken, refreshToken, user, mode, sessionId})
    // console.log({user: typeof mode})
    try {
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      await SecureStore.setItemAsync('sessionId', sessionId)
      await SecureStore.setItemAsync('mode', mode);
      
      set({ 
        user, 
        accessToken, 
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
      await SecureStore.setItemAsync('mode', mode)
      console.log({mode})
      set({mode})
    } catch (error) {
      console.log('Failed to switch mode', error)
    }
  },

  logout: async () => {
    const sessionId = await SecureStore.getItemAsync('sessionId');
    try {
      await client.mutate({
        mutation: LOGOUT,
        variables: {sessionId}
      })
      get().clearAuth()
    } catch (error:any) {
      Alert.alert(error.message)
    }
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('session');
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('mode');
      
      // Clear Apollo cache
      // await client.clearStore();
      
      set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null,
        isAuthenticated: false, 
        isLoading: false,
        mode:'guest',
        sessionId: ''
      });
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  },

  loadAuth: async () => {
    try {
      const [
        accessToken,
        refreshToken,
        sessionId,
        userRaw,
        storedMode
      ] = await Promise.all([
        SecureStore.getItemAsync('accessToken'),
        SecureStore.getItemAsync('refreshToken'),
        SecureStore.getItemAsync('sessionId'),
        SecureStore.getItemAsync('user'),
        SecureStore.getItemAsync('mode'),
      ])
      console.log('ldoa')
      const mode = (storedMode as userMode) ?? 'guest'
  
      if(!accessToken || !refreshToken || !userRaw) {
        console.log('no access')
        set({isLoading: false, mode: 'guest'})
        return null
      }
      const user = JSON.parse(userRaw)
  
      try {
        console.log('getting session')
        const get_session = await client.query({
          query: GET_SESSION,
          variables: {sessionId},
          fetchPolicy: 'network-only'
        })
        console.log('session')

        const sessionData = get_session.data?.getSession
        // console.log({session: session.data.getSession})
        console.log({sessionData})

        if (sessionData.success && sessionData.session?.user) {
          set({
            user: sessionData.session.user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            mode,
            isLoading: false
          })
        } else if (!sessionData.success && sessionData.message == 'session not found') {
          get().clearAuth()
          set({
            isLoading: false, mode: 'guest'
          })
          router.push('/(guest)/(auth)/auth_page')
        }
      } catch (error:any) {
        console.log('eios', {error})
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          mode,
          isLoading: false
        })
      }
    } catch (error) {
      console.error(error)
      set({isLoading: false, mode: 'guest'})
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

}));

setOnTokenRefreshFailed(async () => {
  // await logout()
  await useAuthStore.getState().clearAuth();
})

setOnAuthStateUpdate(async (authData) => {
  const {accessToken, refreshToken, user, sessionId, mode } = authData;
  useAuthStore.getState().setAuth(accessToken, refreshToken, user, sessionId, mode)
})

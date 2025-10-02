import { useStorageState } from '@/hooks/useStorageState';
import { useAuth } from '@/lib/appwrite';
import { createContext, use, useCallback, useEffect, useMemo, type PropsWithChildren } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface SessionProps {
  uid: string,
  mode: string
}

const AuthContext = createContext<{
  signIn: (session:SessionProps) => void;
  signOut: () => void;
  updateSession: (session:SessionProps) => void;
  session: SessionProps | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  updateSession: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const {user, isLoading: loading} = useAuth()

  useEffect(() => {
    console.log('sioeiw')
    if (!user && !loading) {
      setSession(null)
      return
    }
    console.log(user, session)
    setSession({uid: user!, mode: session?.mode || 'guest'})
  }, [user])

  const signIn = useCallback((sessionData: SessionProps) => {
    setSession({...sessionData, mode: 'guest'});
  }, [setSession]);

  const signOut = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const updateSession = useCallback((sessionData: SessionProps) => {
    setSession(sessionData);
  }, [setSession]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    signIn,
    signOut,
    updateSession,
    session,
    isLoading,
  }), [signIn, signOut, updateSession, session, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

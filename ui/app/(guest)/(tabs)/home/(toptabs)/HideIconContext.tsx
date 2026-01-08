// HideIconContext.tsx
import React, { createContext, ReactNode, useState, useMemo, useCallback } from 'react';

interface HideIconContextValue {
  hideIcons: boolean;
  setHideIcons: (v: boolean) => void;
}

export const HideIconContext = createContext<HideIconContextValue>({
  hideIcons: false,
  setHideIcons: () => {},
});

export function HideIconProvider({ children }: { children: ReactNode }) {
  const [hideIcons, setHideIconsState] = useState(false);
  
  // Memoize the setHideIcons callback to prevent unnecessary re-renders
  const setHideIcons = useCallback((value: boolean) => {
    setHideIconsState(value);
  }, []);
  
  // Memoize the context value
  const contextValue = useMemo(() => ({
    hideIcons,
    setHideIcons,
  }), [hideIcons, setHideIcons]);
  
  return (
    <HideIconContext.Provider value={contextValue}>
      {children}
    </HideIconContext.Provider>
  );
}

import { Text, View } from 'react-native';
// import React from 'react'

const miss = () => {
  return (
    <View>
      <Text>miss</Text>
    </View>
  )
}

export default miss

// HideIconContext.tsx
import React, { createContext, ReactNode, useState } from 'react';

interface HideIconContextValue {
  hideIcons: boolean;
  setHideIcons: (v: boolean) => void;
}

export const HideIconContext = createContext<HideIconContextValue>({
  hideIcons: false,
  setHideIcons: () => {},
});

export function HideIconProvider({ children }: { children: ReactNode }) {
  const [hideIcons, setHideIcons] = useState(false);
  return (
    <HideIconContext.Provider value={{ hideIcons, setHideIcons }}>
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

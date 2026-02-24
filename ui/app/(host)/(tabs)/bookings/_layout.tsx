import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingsLayout() {
  const colorScheme = useColorScheme();
  const {theme} = useTheme()
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height


  // return <TopTabsNavigator />

  return (
    <Stack >
    {/* <Stack screenOptions={{presentation: 'fullScreenModal'}}> */}
      <Stack.Screen name='dashboard' options={{headerShown: false, }}/>
      <Stack.Screen name='details' options={{headerShown: false, }}/>
    </Stack> 
    );
}



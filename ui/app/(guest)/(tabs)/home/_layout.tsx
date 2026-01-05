import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {height} = Dimensions.get('screen')

export default function HomeTabLayout() {
  const colorScheme = useColorScheme();
  const {theme} = useTheme()
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height

  const handleHeaderLayout = (event:any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height + insets.top); // Include safe area top inset
  };


  return (
    <Stack>
      <Stack.Screen name='(toptabs)' options={{headerShown: false}}/>
      {/* <Stack.Screen name='listing/[listing]' options={{headerShown: false, animation: 'fade'}}/> */}
      {/* <Stack.Screen name='listing/[listing]' options={{headerShown: false, presentation: 'fullScreenModal', animation: 'fade'}}/> */}
      <Stack.Screen name='(search)/[query]' options={{headerShown: false}}/>
      
    </Stack>
    );
}


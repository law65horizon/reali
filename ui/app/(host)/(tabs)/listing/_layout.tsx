import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListingLayout() {
  const colorScheme = useColorScheme();
  const {theme} = useTheme()
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height

  const handleHeaderLayout = (event:any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height + insets.top); // Include safe area top inset
  };

  // return <TopTabsNavigator />

  return (
    <Stack >
    {/* <Stack screenOptions={{presentation: 'fullScreenModal'}}> */}
      <Stack.Screen name='index' options={{headerShown: false, }}/>
      <Stack.Screen name='start' options={{
        headerShown: false, presentation: 'modal', 
        contentStyle: {marginTop: 140, borderTopEndRadius: 30, borderTopStartRadius: 30, padding: 0,}
      }}/>
       <Stack.Screen name='homes' options={{headerShown: false, presentation:'fullScreenModal'}}/>
       <Stack.Screen name='services' options={{headerShown: false, presentation:'fullScreenModal'}}/>
       <Stack.Screen name='experiences' options={{headerShown: false, presentation: 'fullScreenModal'}}/>
    </Stack> 
    );
}



import React, { useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconProvider } from './HideIconContext';
import TopTabsNavigator from './TobBarNavigator';


export default function HomeTabLayout() {
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
      <ThemedView plain style={[styles.container, { backgroundColor: theme.mode ==='dark'? 'black': 'white' }]}>
        {/* Sticky Header */}
        {/* <HomeScreen. */}

        {/* <View style={{marginTop: headerHeight}}> */}
        {/* <ImageBackground source={require('@/assets/images/background.png')} > */}
          <HideIconProvider>
            <TopTabsNavigator headerHeight={headerHeight}/>
          </HideIconProvider>
        {/* </ImageBackground> */}
        {/* </View> */}
        
      </ThemedView>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 8
  },
});
import React, { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HideIconProvider } from './HideIconContext';
import TopTabsNavigator from './TobBarNavigator';

const {width, height} = Dimensions.get('screen')
export default function TopTabLayout() {
  const colorScheme = useColorScheme();
  const {theme} = useTheme()
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [headerHeight, setHeaderHeight] = useState(0); // Dynamic header height
  const segments = useSegments()
  
  const handleHeaderLayout = (event:any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height + insets.top); // Include safe area top inset
  };

  return (
      <View style={[styles.container, { backgroundColor:theme.colors.backgroundSec, position: 'relative',}]}>

       <View style={[styles.header, {flexDirection: 'row', }]}>
        <Pressable
          onPress={() => {
            const currentSegment = segments[segments.length - 1];
            if (currentSegment === 'homes' || currentSegment === 'experiences') {
              console.log('place', currentSegment)
              router.push({pathname: '/(guest)/(modals)/base_search/[query]', params: {query: JSON.stringify({type: currentSegment.toLowerCase()})}})
            } else {
              router.push({pathname: '/(guest)/(modals)/base_search/[query]', params: {query: JSON.stringify({type: 'homes'})}})
            }
            // router.push({pathname: '/(guest)/(modals)/base_search/[query]', params: {query: JSON.stringify({type: currentSegment.toLowerCase()})}})
          }}
          style={[
            { paddingHorizontal: 12, flex: 1},
          ]}
          onLayout={handleHeaderLayout}
        >      
  
          {/* <ThemedView plain style={[styles.searchRow, {borderRadius: 15, width: '100%', shadowColor: theme.mode === 'light'? '#000': '#000', backgroundColor: theme.colors.card}]}> */}
          <View style={[styles.searchRow, {shadowColor: theme.mode === 'light'? '#000': '#000', backgroundColor: theme.colors.background2}]}>
            <IconSymbol size={24} name="magnifyingglass" color={theme.colors.text} />
            <ThemedText style={{fontWeight: '600'}}>Start your search</ThemedText>
          </View>
  
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 10, width: 50,}} >
          <Pressable>
            <MaterialCommunityIcons name="bell-badge" size={24} color={theme.colors.text} />
          </Pressable>
        </View>
       </View>
        <HideIconProvider>
          <TopTabsNavigator headerHeight={headerHeight}/>
        </HideIconProvider>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
    // paddingHorizontal: 8
  },
  header: {
    // position: 'fixed',
    // top: 0,
    // left: 0,
    // // right: 0,
    // zIndex: 1000,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    height: 45,
    gap: 8,
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
    borderRadius: 15, width: '100%', 
  },
  
});
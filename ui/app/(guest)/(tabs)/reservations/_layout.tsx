import React, { useState } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/theme/theme';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReservationTabLayout() {
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
    <Stack>
      <Stack.Screen name='trips' options={{headerShown: false}}/>
    </Stack>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2},
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 5
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 28,
    // paddingHorizontal: 12,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  filterContainer: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  carouselContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  carouselContent: {
    // paddingHorizontal: 8,
  },
  carouselItem: {
    width: 100,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  carouselText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  flatList: {
    flex: 1,
  },
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    // paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardOverlayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDetails: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
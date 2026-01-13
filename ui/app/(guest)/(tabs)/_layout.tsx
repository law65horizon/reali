import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const MemoizedIconSymbol = React.memo(IconSymbol);
const MemoizedMaterialCommunityIcons = React.memo(MaterialCommunityIcons);

export default function TabLayout() {
  const {theme} = useTheme()

  // Memoize screen options to prevent re-renders
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    headerShown: false,
    tabBarButton: HapticTab,
    lazy: true, // Enable lazy loading for better performance
    tabBarStyle: [styles.tabBar, {
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.card,
    }],
    tabBarLabelStyle: {
      fontFamily: 'SpaceMono',
      fontWeight: '500' as const,
      fontSize: 12,
    },
  }), [theme.colors.primary, theme.colors.textSecondary, theme.colors.card]);

  return (
    <Tabs  screenOptions={screenOptions}>
    {/* <Tabs  screenOptions={screenOptions}> */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name={focused ? 'magnifyingglass' : 'magnifyingglass'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen 
        name='wishlists'
        options={{
          title: 'Wishlists',
          tabBarIcon: ({color, focused}) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name={focused ? 'heart.fill' : 'heart'} 
              color={color} 
            />
          )
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              size={focused ? 26 : 24} 
              name={focused ? 'bookmark' : 'bookmark-outline'} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name={focused ? 'person.fill' : 'person'} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

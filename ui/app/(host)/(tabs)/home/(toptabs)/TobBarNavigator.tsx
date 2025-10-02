// TopTabsNavigator.tsx
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/theme/theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useContext } from 'react';
import { Dimensions, StyleSheet, useColorScheme, View } from 'react-native';
import { HideIconContext } from './HideIconContext';
import HomesTab from './Homes';
import Upcoming from './Upcoming';

const TopTab = createMaterialTopTabNavigator();

interface Props {
    headerHeight: Number
}

export default function TopTabsNavigator({headerHeight}:Props) {
    const colorScheme = useColorScheme();
    const {theme} = useTheme()
    const { width: screenWidth } = Dimensions.get('window');
    const {hideIcons} = useContext(HideIconContext)
  return (
    <TopTab.Navigator
      screenOptions={{
        // tabBarBu
        swipeEnabled: true,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
        //   backgroundColor: 'red',
          borderTopWidth: 0,
          backgroundColor: theme.colors.card,
          height: 115,
          // height: hideIcons ? 45: 74,
          margin: 0,
          paddingTop: 40,
          paddingHorizontal: 12,
          justifyContent: 'center'
        },
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
            width: 0,
            height: 0
        }
        
      }}
    >
      <TopTab.Screen 
        name="Homes" 
        component={HomesTab} 
        options={{
            title: 'Homes',
            tabBarIcon: ({ color, focused }) => (
                <View style={{
                  marginBottom: 50, alignItems: 'center', justifyContent: 'center',
                   backgroundColor: focused ? theme.colors.background : theme.colors.text,
                   paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30
                }} >
                  <ThemedText style={{color: focused? theme.colors.text : theme.colors.background }}>Today</ThemedText>
                </View>
            ),
        }}
       />
      <TopTab.Screen 
        name="Upcoming" 
        component={Upcoming} 
        options={{
            title: 'Upcoming',
            tabBarIcon: ({ color, focused }) => (
                <View style={{
                  marginBottom: 50, alignItems: 'center', justifyContent: 'center',
                   backgroundColor: focused ? theme.colors.background : theme.colors.text,
                   paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30
                }} >
                  <ThemedText style={{color: focused? theme.colors.text : theme.colors.background }}>Upcoming</ThemedText>
                </View>
            ),
        }}
       />
      
    </TopTab.Navigator>
  );
}


const styles = StyleSheet.create({
    tabIndicator: {
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        borderWidth: 1,
        // borderRadius: '50%',
        width: '100%',
        height: 2.5,
        position: 'absolute',
        bottom: -7
    }
})
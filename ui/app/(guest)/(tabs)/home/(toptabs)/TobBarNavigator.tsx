import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/theme/theme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'expo-image';
import React, { memo, useContext, useMemo } from 'react';
import { Dimensions, StyleSheet, useColorScheme, View } from 'react-native';
import ExperiencesTab from './Experience';
import { HideIconContext } from './HideIconContext';
import HomesTab from './Homes';

const TopTab = createMaterialTopTabNavigator();

interface Props {
    headerHeight: Number;
}

const TopTabsNavigator = memo(function TopTabsNavigator({ headerHeight }: Props) {
    const colorScheme = useColorScheme();
    const { theme } = useTheme();
    const { hideIcons } = useContext(HideIconContext);
    const { width: screenWidth } = Dimensions.get('window');

    // Calculate custom tab bar width (e.g., 80% of screen width)
    const tabBarWidth = useMemo(() => screenWidth * 0.9, [screenWidth]) ; // Adjust as needed (e.g., 0.7 for 70% or 300 for fixed width)

    // Calculate width for each tab item (3 tabs: Homes, Services, Smoi)
    const tabItemWidth = useMemo(() => tabBarWidth / 2 ,[tabBarWidth]); // Divide equally among 3 tabs

    // Memoize screen options to prevent re-renders
    const screenOptions = useMemo(
        () => ({
            swipeEnabled: true,
            lazy: true,
            unmountOnBlur: false,
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
                borderWidth: 0,
                // backgroundColor: 'red',
                backgroundColor: 'transparent',
                // keep height stable to avoid layout shifts
                // height: 58,
                width: tabBarWidth,
                alignSelf: 'center' as const,
                marginTop: 5,
                // borderRadius: 20,
                paddingHorizontal: 0, 
                justfyContent: 'space-around'
            },
            tabBarItemStyle: {
                width: tabItemWidth, // Set explicit width for each tab
                padding: 0, // Remove any default padding
                margin: 0, // Remove any default margin
            },
            tabBarShowLabel: false,
            tabBarIndicatorStyle: {
                width: 0,
                height: 0,
            },
        }),
        [colorScheme, theme.colors.backgroundSec, hideIcons, tabBarWidth, tabItemWidth]
    );

    return (
        <TopTab.Navigator screenOptions={screenOptions}>
            <TopTab.Screen
                name="homes"
                component={HomesTab}
                options={{
                    title: 'homes',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, { width: tabItemWidth, alignItems: 'center' }]}>
                            {!hideIcons && (
                                <>
                                    <Image source={require('@/assets/images/building.png')} style={{width: 30, height: 30}} />
                                </>
                            )}
                            <ThemedText>Homes</ThemedText>
                            {focused && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.border }]} />}
                        </View>
                    ),
                }}
            />
            <TopTab.Screen
                name="experiences"
                component={ExperiencesTab}
                options={{
                    title: 'experiences',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, { width: tabItemWidth, alignItems: 'center' }]}>
                            {!hideIcons && (
                                <>
                                    <Image source={require('@/assets/images/calendar.png')} style={{width: 30, height: 30}} />
                                </>
                            )}
                            <ThemedText>Experiences</ThemedText>
                            {focused && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.border }]} />}
                        </View>
                    ),
                }}
            />
            {/* <TopTab.Screen
                name="services"
                component={ServicesTab}
                options={{
                    title: 'Smoi',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, { width: tabItemWidth, alignItems: 'center' }]}>
                            {!hideIcons && (
                                <>
                                    <Image source={require('@/assets/images/customer-service.png')} style={{width: 30, height: 30}} />
                                </>
                            )}
                            <ThemedText>Services</ThemedText>
                            {focused && <View style={[styles.tabIndicator, { backgroundColor: theme.colors.border }]} />}
                        </View>
                    ),
                }}
            /> */}
        </TopTab.Navigator>
    );
});

const styles = StyleSheet.create({
    tabItem: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        margin: 0,
        height: '100%'
    },
    tabIndicator: {
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        borderWidth: 1,
        width: '25%', // Slightly narrower than the tab item for better aesthetics
        height: 4,
        // position: 'absolute',
        // bottom: 3,
        zIndex: 100,
        // marginTop: 20
    },
});

export default TopTabsNavigator;
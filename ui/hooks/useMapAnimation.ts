// import { HideIconContext } from '@/app/(guest)/(tabs)/home/(toptabs)/HideIconContext';
// import { useCallback, useContext, useRef } from 'react';
// import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
// // import { HideIconContext } from './HideIconContext';

// const { height } = Dimensions.get('window');

// export const useMapAnimation = (scrollViewRef: React.RefObject<ScrollView>|null) => {
//   const { setHideIcons } = useContext(HideIconContext);
//   const scrollY = useRef(0);
//   const mapAnim = useRef<any>(new Animated.Value(0)).current; // Controls map position and opacity
//   const mapHeight = height - 380;

//   const mapTranslateY = mapAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [mapHeight, 0], // Slide from bottom to top
//   });

//   const mapOpacity = mapAnim.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [0, 0.5, 1], // Fade in/out
//   });

//   const onScroll = useCallback(
//     (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//       const yOffset = e.nativeEvent.contentOffset.y;
//       scrollY.current = yOffset;
//       setHideIcons(yOffset > 0);

//       // Update map animation based on scroll position
//       const progress = Math.max(0, Math.min(1, 1 - yOffset / mapHeight));
//       mapAnim.setValue(progress);
//     },
//     [setHideIcons, mapHeight, mapAnim]
//   );

//   const handleMapToggle = useCallback(() => {
//     const toValue = mapAnim._value === 1 ? 0 : 1;
//     Animated.timing(mapAnim, {
//       toValue,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//     if (toValue === 1 && scrollViewRef?.current) {
//       scrollViewRef.current.scrollTo({ y: 0, animated: true });
//     }
//   }, [mapAnim, scrollViewRef]);

//   const handleScrollBeginDrag = useCallback(() => {
//     if (scrollY.current <= 0 && mapAnim._value < 1) {
//       Animated.timing(mapAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [mapAnim]);

//   return {
//     mapAnim,
//     mapTranslateY,
//     mapOpacity,
//     mapHeight,
//     onScroll,
//     handleMapToggle,
//     handleScrollBeginDrag,
//   };
// };

import { HideIconContext } from '@/app/(guest)/(tabs)/home/(toptabs)/HideIconContext';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';


const { height } = Dimensions.get('window');

export const useMapAnimation = (scrollViewRef: React.RefObject<ScrollView |any | null>) => {
  const { setHideIcons } = useContext(HideIconContext);
  const scrollY = useRef(0);
  const mapAnim = useRef<any>(new Animated.Value(0)).current; // Initialize map as closed
  const mapHeight = height - 380;

  const mapTranslateY = mapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [mapHeight, 0], // Slide from bottom to top
  });

  const mapOpacity = mapAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1], // Fade in/out
  });

  const fabOpacity = mapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // FAB visible when map is closed
  });

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const yOffset = e.nativeEvent.contentOffset.y;
      scrollY.current = yOffset;
      setHideIcons(yOffset > 0);

      // Update map animation based on scroll position
      const progress = Math.max(0, Math.min(1, 1 - yOffset / mapHeight));
      mapAnim.setValue(progress);
    },
    [setHideIcons, mapHeight, mapAnim]
  );

  const handleMapToggle = useCallback(() => {
    const toValue = mapAnim._value < 0.5 ? 1 : 0; // Toggle based on current state
    Animated.timing(mapAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (toValue === 1 && scrollViewRef.current) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [mapAnim, scrollViewRef]);

//   const handleScrollBeginDrag = useCallback(() => {
//     if (scrollY.current <= 0 && mapAnim._value < 0.5) {
//       Animated.timing(mapAnim, {
//         toValue: 1,
//         duration: 1.6,
//         useNativeDriver: true,
//       }),
//         handleScrollBeginDrag().start();
//     }
//   }, []);

  const handleScrollBeginDrag = useCallback(() => {
    if (scrollY.current <= 0 && mapAnim._value < 0.5) {
      Animated.timing(mapAnim, {
        toValue: 1,
        duration: 1.6,
        useNativeDriver: true,
      }).start();
    }
  }, [mapAnim]);

  // Ensure map starts closed
  useEffect(() => {
    mapAnim.setValue(0);
  }, [mapAnim]);

  return {
    mapAnim,
    mapTranslateY,
    mapOpacity,
    fabOpacity,
    mapHeight,
    onScroll,
    handleMapToggle,
    handleScrollBeginDrag,
  };
};
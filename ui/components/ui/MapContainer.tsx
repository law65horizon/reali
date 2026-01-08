// import { useTheme } from '@/theme/theme';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import React, { useMemo } from 'react';
// import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
// import { ThemedText } from '../ThemedText';
// import MapFAB from './MapFAB';

// const { width, height } = Dimensions.get('window');

// interface MapContainerProps {
//   mapAnim: any;
//   // mapAnim: Animated.Value;
//   mapTranslateY: Animated.AnimatedInterpolation<string | number>;
//   mapOpacity: Animated.AnimatedInterpolation<string | number>;
//   fabOpacity: Animated.AnimatedInterpolation<string | number>;
//   mapHeight: number;
//   handleMapToggle: () => void;
// }

// export const MapContainer: React.FC<MapContainerProps> = ({
//   mapAnim,
//   mapTranslateY,
//   mapOpacity,
//   fabOpacity,
//   mapHeight,
//   handleMapToggle,
// }) => {
//   const { theme } = useTheme();

//   // Only render MapFAB when map is at least partially open
//   const shouldRenderMap = useMemo(() => mapAnim._value > 0.8, [mapAnim]);
//   const sjowj = useMemo(() => {
//     if (mapAnim._value > 0.8) {
//       console.log('sispij')
//     }
//     return mapAnim._value > 0.8
//   }, [mapAnim])
//   console.log(shouldRenderMap, sjowj, mapAnim._value)

//   return (
//     <>
//       <Animated.View style={[styles.mapTextContainer, { opacity: fabOpacity, zIndex: 20 }]}>
//         <Pressable onPress={handleMapToggle}>
//           <View style={[styles.mapContainer, { backgroundColor: theme.colors.text }]}>
//             <MaterialCommunityIcons name="map" size={24} color={theme.colors.background} />
//             <ThemedText style={{ color: theme.colors.background }}>Map</ThemedText>
//           </View>
//         </Pressable>
//       </Animated.View>
//       {sjowj && (
//         <Animated.View
//           style={{
//             width,
//             height: mapHeight,
//             position: 'absolute',
//             top: 0,
//             transform: [{ translateY: mapTranslateY }],
//             opacity: mapOpacity,
//             zIndex: 10,
//           }}
//           removeClippedSubviews={true}
//         >
//           <MapFAB style={{ width, height: mapHeight, backgroundColor: 'transparent' }} />
//         </Animated.View>
//       )}
      
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   mapTextContainer: {
//     position: 'absolute',
//     bottom: 130,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   mapContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 13,
//     paddingVertical: 13,
//     gap: 5,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
// });

import { useTheme } from '@/theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import MapFAB from './MapFAB';

const { width, height } = Dimensions.get('window');

interface MapContainerProps {
  mapAnim: any; // Explicitly type mapAnim as Animated.Value
  mapTranslateY: Animated.AnimatedInterpolation<string | number>;
  mapOpacity: Animated.AnimatedInterpolation<string | number>;
  fabOpacity: Animated.AnimatedInterpolation<string | number>;
  mapHeight: number;
  handleMapToggle: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapAnim,
  mapTranslateY,
  mapOpacity,
  fabOpacity,
  mapHeight,
  handleMapToggle,
}) => {
  const { theme } = useTheme();
  const [animValue, setAnimValue] = useState(mapAnim._value); // State to track animated value

  // Listen to mapAnim changes
  useEffect(() => {
    const listener = mapAnim.addListener(({ value }:any) => {
      setAnimValue(value); // Update state when animated value changes
    });

    // Clean up listener on unmount
    return () => mapAnim.removeListener(listener);
  }, [mapAnim]);

  // Compute shouldRenderMap and sjowj based on animValue
  const shouldRenderMap = useMemo(() => animValue > 0.85, [animValue]);
  // const sjowj = useMemo(() => {
  //   if (animValue > 0.8) {
  //     console.log('sispij');
  //   }
  //   return animValue > 0.8;
  // }, [animValue]);

  // console.log(shouldRenderMap, animValue);

  return (
    <>
      <Animated.View style={[styles.mapTextContainer, { opacity: fabOpacity, zIndex: 20 }]}>
        <Pressable onPress={handleMapToggle}>
          <View style={[styles.mapContainer, { backgroundColor: theme.colors.text }]}>
            <MaterialCommunityIcons name="map" size={24} color={theme.colors.background} />
            <ThemedText style={{ color: theme.colors.background }}>Map</ThemedText>
          </View>
        </Pressable>
      </Animated.View>
      {shouldRenderMap && (
        <Animated.View
          style={{
            width,
            height: mapHeight,
            position: 'absolute',
            top: 0,
            transform: [{ translateY: mapTranslateY }],
            opacity: mapOpacity,
            zIndex: 10,
          }}
          removeClippedSubviews={true}
        >
          <MapFAB style={{ width, height: mapHeight, backgroundColor: 'transparent' }} />
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mapTextContainer: {
    position: 'absolute',
    bottom: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 13,
    gap: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
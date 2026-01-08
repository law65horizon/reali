// import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
// import { PlatformPressable } from '@react-navigation/elements';
// import * as Haptics from 'expo-haptics';
// import { memo, useCallback } from 'react';

// export const HapticTab = memo(function HapticTab(props: BottomTabBarButtonProps) {
//   const handlePressIn = useCallback((ev: any) => {
//     if (process.env.EXPO_OS === 'ios') {
//       // Add a soft haptic feedback when pressing down on the tabs.
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//     props.onPressIn?.(ev);
//   }, [props.onPressIn]);

//   return (
//     <PlatformPressable
//       {...props}
//       onPressIn={handlePressIn}
//     />
//   );
// });
 import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

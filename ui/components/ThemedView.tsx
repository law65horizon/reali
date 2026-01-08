import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  plain?: boolean,
  secondary?: boolean,
  elevated?: boolean,
  rounded?: boolean
};

export function ThemedView({ style, lightColor, darkColor, plain, secondary, elevated, rounded, ...otherProps }: ThemedViewProps) {
  
  const {theme} = useTheme()
  
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return theme.mode === 'light' ? lightColor : darkColor;
    }
    return secondary ? theme.colors.backgroundSec : theme.colors.background;
  };
  
  const getElevationStyles = () => {
    if (!elevated) return {};
    
    return {
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    };
  };
  
  const getRoundedStyles = () => {
    if (!rounded) return {};
    return { borderRadius: 12 };
  };
  
  const baseStyle = {
    backgroundColor: getBackgroundColor(),
    ...getElevationStyles(),
    ...getRoundedStyles(),
  };
  
  return (
    <>
      {theme.mode === 'light' || plain
       ? <View style={[baseStyle, style]} {...otherProps} />
      //  : <ImageBackground source={require('@/assets/images/background.png')} contentFit='cover' style={[style]}>
      //         <View style={[{ backgroundColor: 'transparent', width: '100%' }, baseStyle]} {...otherProps} />
      //        </ImageBackground>
      : <View style={[baseStyle, style]} {...otherProps} />
      }
    </>
  )
}

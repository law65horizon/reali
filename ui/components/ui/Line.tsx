import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/theme';

export type LineProps = ViewProps & {
  color?: string
  orientation?: 'vertical' | 'horizontal'
};

export function Line({ style, color, orientation, ...otherProps }: LineProps) {
  
  // const backgroundColor = useThemeColor({ori}, 'background');
  const {theme} = useTheme()
  return <View style={[{ backgroundColor: color || theme.colors.border, borderColor: theme.colors.border, borderBottomWidth: orientation == 'horizontal' ? 1: 0, borderLeftWidth: orientation== 'vertical'? 1: 0}, style]} />;
  // return <View style={[{ backgroundColor: color || theme.colors.border, borderColor: 'rgba(231, 216, 216, 0.88)', borderBottomWidth: orientation == 'horizontal' ? 1: 0, borderLeftWidth: orientation== 'vertical'? 1: 0}, style]} />;
}

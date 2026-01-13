import { useTheme } from '@/theme/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle| any;
  elevated?: boolean;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  backgroundColor?: string;
  onPress?: () => void;
}


export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = true,
  // padding = 16,
  // margin = 0,
  // borderRadius = 12,
  backgroundColor,
  onPress,
}) => {
  const { theme } = useTheme();

  const cardStyles: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.card,
    borderRadius: 32,
    // padding,
    // margin,
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode == 'dark' ? 0.4: 0.1,
      shadowRadius: 3,
      elevation: 5,
    }),
  };

  return (
    <TouchableOpacity 
      style={[cardStyles, style,  ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // No additional styles needed for now
  
});

export default Card;

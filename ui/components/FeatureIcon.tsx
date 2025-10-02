// src/components/FeatureIcon.tsx
import { useTheme } from '@/theme/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { featureIconMap, PropertyFeature } from '../constants/featureIcons';
import { ThemedText } from './ThemedText';

interface FeatureIconProps {
  style?: ViewStyle;
  feature: PropertyFeature;
  size?: number; // Icon size
  color?: string; // Icon color
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({
  feature,
  size = 24,
  color,
  style,
}) => {
  const IconComponent = featureIconMap[feature]?.iconSet;
  const iconName = featureIconMap[feature]?.iconName;
  const description = featureIconMap[feature]?.description;
  const {theme} = useTheme()

  if (!IconComponent || !iconName) {
    // Fallback for unmapped features
    return null;
  }

  return (
    <View style={styles.container}>
      <IconComponent name={iconName} size={size} color={color || theme.colors.text} style={style} />
      <ThemedText >{description}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8
  },
  description: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});
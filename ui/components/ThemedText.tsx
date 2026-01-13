import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'body' | 'heading';
  secondary?: boolean,
  spacemono?: boolean
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  secondary,
  spacemono,
  ...rest
}: ThemedTextProps) {
  // const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const {theme} = useTheme()

  // console.log(type)

  return (
    <Text
      style={[
        { color: secondary ? theme.colors.textSecondary: theme.colors.text,  },
        // { color: secondary ? theme.colors.textSecondary: theme.colors.text, fontFamily: 'SpaceMono' },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'heading' ? styles.heading : undefined,
        secondary && {fontSize: 14},
        spacemono && {fontFamily: 'SpaceMono'},
        // {fontSize: secondary && 14},
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 15,
    // lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 15,
    // lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

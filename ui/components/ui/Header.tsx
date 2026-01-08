import { useTheme } from '@/theme/theme';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { ThemedView } from '../ThemedView';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

const Header = ({ title, showBackButton = true, onBackPress, rightElement, style }: HeaderProps) => {
  const {theme} = useTheme()
  const navigation = useNavigation()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    // <ThemedView plain style={[styles.header, style ]}>
     <ThemedView plain style={[styles.header, { backgroundColor: theme.colors.header }]}>
      {showBackButton && (
        <Pressable 
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Entypo name='cross' size={24} color={theme.colors.text} />
        </Pressable>
      )}
      {rightElement && (
        <ThemedView style={styles.rightElement}>
          {rightElement}
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;

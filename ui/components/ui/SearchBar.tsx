import React, { useState } from 'react';
import { TextInput, View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/theme';
import { IconSymbol } from './IconSymbol';
import { ThemedText } from '../ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFilter?: () => void;
  style?: ViewStyle;
  showFilter?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  onFilter,
  style,
  showFilter = true,
  editable = true,
  autoFocus = false,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
  };

  const searchBarStyles = {
    backgroundColor: theme.colors.card,
    borderColor: isFocused ? theme.colors.primary : theme.colors.border,
    borderWidth: 1,
    borderRadius: 28,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[searchBarStyles, { flex: 1 }]}>
        <MaterialIcons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontFamily: 'SpaceMono',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          autoFocus={autoFocus}
          returnKeyType="search"
          accessibilityLabel="Search input"
          accessibilityHint="Enter search terms"
        />
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="close"
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      
      {showFilter && (
        <Pressable
          onPress={onFilter}
          style={[
            styles.filterButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          accessibilityLabel="Filter options"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="tune"
            size={20}
            color={theme.colors.text}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default SearchBar;

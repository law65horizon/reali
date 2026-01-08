// theme/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type Theme = {
  colors: {
    background: string;
    backgroundSec: string;
    text: string;
    icon: string;
    border: string;
    primary: string;
    textSecondary: string;
    header: string;
    tint?: string;
    background2?: string;
    // Modern UI colors
    accent: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    shadow: string;
    backgroundInput: string;
    textPlaceholder: string;
    buttonText: string;
    // Add more colors as needed f0eee1
  };
  mode: ColorSchemeName;
};

const lightTheme: Theme = {
  colors: { 
    background: '#FFFFFF',
    tint: '#FFFFFF',
    text: '#1A1A1A',
    icon: '#2C2C2C',
    border: '#E0E0E0',
    primary: '#FF6B6B', // #ff88ff
    backgroundSec: '#f4f4f4', 
    // backgroundSec: '#F8F9FA', 
    background2: '#F5F5F5',
    textSecondary: '#6B7280',
    header: '#FFFFFF', 
    accent: '#4ECDC4',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#FFFFFF',
    shadow: '#000000',
    backgroundInput: '#FAFAFA',
    textPlaceholder: '#999999',
    buttonText: '#FFFFFF',
  },
  mode: 'light',
};

// const lightTheme: Theme = {
//   colors: { 
//     background: '#F0EEE1', // Base color as requested
//     tint: '#F0EEE1', // Matching background for consistency
//     text: '#1A1A1A',
//     icon: '#2C2C2C',
//     border: '#D8D6C9', // Slightly darker shade of #f0eee1
//     primary: '#FF6B6B',
//     backgroundSec: '#E8E6D9', // Slightly darker variant of #f0eee1
//     background2: '#E4E2D5', // Another shade for depth
//     textSecondary: '#6B7280',
//     header: '#F0EEE1', // Matching background
//     accent: '#4ECDC4',
//     success: '#10B981',
//     warning: '#F59E0B',
//     error: '#EF4444',
//     card: '#F0EEE1', // Matching background
//     shadow: '#000000',
//   },
//   mode: 'light',
// };

const darkTheme: Theme = {
  colors: {
    background: '#0F0F0F',
    background2: '#2e2f2f',
    tint: '#1A1A1A',
    text: '#FFFFFF',
    icon: '#D1D5DB',
    border: '#374151',
    primary: '#FF6B6B',
    backgroundSec: '#1A1A1A', // '#1F2937'
    textSecondary: '#9CA3AF',
    header: '#0F0F0F',
    accent: 'rgba(78, 205, 196, 1)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#1A1A1A',
    shadow: 'rgba(255, 255, 255, 0.06)',
    backgroundInput: '#2A2A2A',
    textPlaceholder: '#666666',
    buttonText: '#FFFFFF',
  },
  mode: 'dark',
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('theme');
        if (isMounted) {
          if (savedMode) {  
            setMode(savedMode as ColorSchemeName);
          } else {
            setMode(Appearance.getColorScheme());
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        if (isMounted) {
          setMode(Appearance.getColorScheme());
          setIsLoading(false);
        }
      }
    };
    
    loadTheme();

    const listener = Appearance.addChangeListener(async ({ colorScheme }) => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (!savedTheme && isMounted) {
          setMode(colorScheme);
        }
      } catch (error) {
        console.error('Error in appearance listener:', error);
      }
    });
    
    return () => {
      isMounted = false;
      listener.remove();
    };
  }, []);

  // Memoize theme object to prevent unnecessary re-renders
  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  const toggleTheme = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [mode]);

  // Memoize context value
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


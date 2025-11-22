import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from './themes/themeTypes';
import { lightTheme } from './themes/lightTheme';
import { darkTheme } from './themes/darkTheme';
import { IThemeContext, IThemeProviderProps } from './ThemeContext/types';

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export const ThemeProvider: React.FC<IThemeProviderProps> = ({
  children,
  initialTheme,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    initialTheme || (systemColorScheme === 'dark' ? 'dark' : 'light')
  );

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const value: IThemeContext = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


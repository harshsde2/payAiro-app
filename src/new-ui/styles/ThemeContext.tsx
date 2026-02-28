import React, { createContext, useContext } from 'react';
import { ThemeMode } from './themes/themeTypes';
import { lightTheme } from './themes/lightTheme';
import { darkTheme } from './themes/darkTheme';
import { IThemeContext, IThemeProviderProps } from './ThemeContext/types';
import { useTheme as useAppTheme } from '../../styles/ThemeContext';

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

/**
 * NewUIThemeProvider bridges the current app's theme mode to the new-ui ITheme.
 * Must be used inside the app's ThemeProvider (from styles/ThemeContext).
 */
export const ThemeProvider: React.FC<IThemeProviderProps> = ({ children }) => {
  const appTheme = useAppTheme();
  const themeMode: ThemeMode = appTheme.themeMode;
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const value: IThemeContext = {
    theme,
    themeMode,
    setThemeMode: appTheme.setThemeMode as (mode: ThemeMode) => void,
    toggleTheme: appTheme.toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme must be used within a NewUI ThemeProvider (and the app ThemeProvider)'
    );
  }
  return context;
};

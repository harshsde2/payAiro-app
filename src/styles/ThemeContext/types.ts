import { ReactNode } from 'react';
import { ITheme, ThemeMode } from '../themes/themeTypes';

export interface IThemeContext {
  theme: ITheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export interface IThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}


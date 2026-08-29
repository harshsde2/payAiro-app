import { ReactNode } from 'react';
import { ITheme, ThemeMode, ThemePreference } from '../themes/themeTypes';

export interface IThemeContext {
  /** The resolved theme object for the active mode. */
  theme: ITheme;
  /** The mode actually being rendered — never 'system'. */
  themeMode: ThemeMode;
  /** True when the mode is being followed from the OS setting. */
  isSystemTheme: boolean;
  /** What the user picked in Settings → Appearance ('system' included). */
  themePreference: ThemePreference;
  setThemeMode: (mode: ThemePreference) => void;
  toggleTheme: () => void;
}

export interface IThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

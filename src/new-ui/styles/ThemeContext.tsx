import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { ITheme, ThemeMode, ThemePreference } from './themes/themeTypes';
import { lightTheme } from './themes/lightTheme';
import { darkTheme } from './themes/darkTheme';
import { IThemeContext, IThemeProviderProps } from './ThemeContext/types';
import { STORAGE_KEYS, getItem, setItem } from '../../storage/mmkv';

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

/** Shape persisted to MMKV under STORAGE_KEYS.APPEARANCE_PREFERENCE. */
interface StoredPreference {
  preference: ThemePreference;
}

const resolveSystemMode = (): ThemeMode =>
  Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

/**
 * Reads the saved preference synchronously so the very first render already paints in the
 * right mode — an async read here would flash the wrong theme on every cold launch.
 * Falls back to 'system' when nothing is stored or the stored value is unreadable.
 */
const readStoredPreference = (): ThemePreference => {
  try {
    const raw = getItem(STORAGE_KEYS.APPEARANCE_PREFERENCE);
    if (!raw) {
      return 'system';
    }
    const parsed = JSON.parse(raw) as StoredPreference;
    if (
      parsed?.preference === 'light' ||
      parsed?.preference === 'dark' ||
      parsed?.preference === 'system'
    ) {
      return parsed.preference;
    }
  } catch {
    // Corrupt or partially-written value — fall through to the default.
  }
  return 'system';
};

/**
 * Owns the app's appearance: the active mode, the user's preference, MMKV persistence and
 * the OS-appearance subscription. This is the single source of truth for new-ui — it does
 * not read from the legacy styles/ThemeContext.
 */
export const ThemeProvider: React.FC<IThemeProviderProps> = ({
  children,
  initialTheme,
}) => {
  const [themePreference, setThemePreference] =
    useState<ThemePreference>(readStoredPreference);

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = readStoredPreference();
    if (stored === 'system') {
      return initialTheme ?? resolveSystemMode();
    }
    return stored;
  });

  // Follow the OS only while the user's preference is 'system'; a hard Light/Dark choice
  // must not be overridden when the device flips.
  useEffect(() => {
    if (themePreference !== 'system') {
      return;
    }
    setThemeModeState(resolveSystemMode());
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeModeState(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, [themePreference]);

  const setThemeMode = useCallback((preference: ThemePreference) => {
    setThemePreference(preference);
    // The 'system' branch is also handled by the effect above, but resolving here too keeps
    // the change synchronous with the tap instead of waiting a render.
    setThemeModeState(
      preference === 'system' ? resolveSystemMode() : preference
    );
    try {
      setItem(
        STORAGE_KEYS.APPEARANCE_PREFERENCE,
        JSON.stringify({ preference } satisfies StoredPreference)
      );
    } catch {
      // Persistence is best-effort; the in-memory choice still applies for this session.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  }, [themeMode, setThemeMode]);

  const value = useMemo<IThemeContext>(
    () => ({
      theme: themeMode === 'dark' ? darkTheme : lightTheme,
      themeMode,
      isSystemTheme: themePreference === 'system',
      themePreference,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, themePreference, setThemeMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Resolves the active theme WITHOUT the React context, for the few things that render
 * outside or above the provider — chiefly the crash screen, which must not depend on the
 * provider because the provider may be what failed.
 */
export const resolveThemeWithoutProvider = (): ITheme => {
  const preference = readStoredPreference();
  const mode = preference === 'system' ? resolveSystemMode() : preference;
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const useTheme = (): IThemeContext => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a NewUI ThemeProvider');
  }
  return context;
};

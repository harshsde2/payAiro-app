import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { lightTheme, darkTheme, Theme, ThemeMode } from "./theme";
import { STORAGE_KEYS, getItem, setItem } from "../storage/mmkv";

// Define the context type
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isSystemTheme: boolean;
  setThemeMode: (mode: ThemeMode | "system") => void;
  toggleTheme: () => void;
}

// Create the context
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

// Create the provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "light",
}) => {
  // Track if using system preference
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(false);

  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);

  // Get the active theme based on the theme mode
  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  // Initialize theme from storage or device settings
  useEffect(() => {
    const initTheme = async () => {
      // Try to get saved theme from storage
      const savedThemeData = await getItem(STORAGE_KEYS.THEME_PREFERENCE);
      if (savedThemeData) {
        const { mode, isSystem } = JSON.parse(savedThemeData);
        setIsSystemTheme(isSystem);

        if (isSystem) {
          // Use device color scheme if system theme is enabled
          const colorScheme = Appearance.getColorScheme();
          setThemeMode("light");
        } else {
          // Otherwise use saved theme
          setThemeMode(mode || defaultTheme);
        }
      } else {
        // Default to system theme if no preference is saved
        const colorScheme = Appearance.getColorScheme();
        setThemeMode(colorScheme === "dark" ? "dark" : "light");
        setIsSystemTheme(true);
        saveThemePreference("system");
      }
    };

    initTheme();
  }, [defaultTheme]);

  // Listen to system theme changes if using system theme
  useEffect(() => {
    if (isSystemTheme) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setThemeMode(colorScheme === "dark" ? "dark" : "light");
      });

      return () => {
        subscription.remove();
      };
    }
  }, [isSystemTheme]);

  // Save theme preference to storage
  const saveThemePreference = (mode: ThemeMode | "system") => {
    const isSystem = mode === "system";
    const themeData = {
      mode: isSystem
        ? Appearance.getColorScheme() === "dark"
          ? "dark"
          : "light"
        : mode,
      isSystem,
    };
    setItem(STORAGE_KEYS.THEME_PREFERENCE, JSON.stringify(themeData));
  };

  // Handle theme mode changes
  const handleSetThemeMode = (mode: ThemeMode | "system") => {
    if (mode === "system") {
      const colorScheme = Appearance.getColorScheme();
      setThemeMode(colorScheme === "dark" ? "dark" : "light");
      setIsSystemTheme(true);
    } else {
      setThemeMode(mode);
      setIsSystemTheme(false);
    }
    saveThemePreference(mode);
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    setIsSystemTheme(false);
    saveThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isSystemTheme,
        setThemeMode: handleSetThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

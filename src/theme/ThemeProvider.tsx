import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { readJSON, StorageKeys, writeJSON } from '../storage/storage';
import { darkColors, lightColors, ThemeColors } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  /** False until the persisted mode has been read — avoids a theme flash on launch. */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const VALID_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // updates live when the OS appearance changes
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJSON<ThemeMode>(StorageKeys.themeMode, 'light').then(saved => {
      if (VALID_MODES.includes(saved)) {
        setModeState(saved);
      }
      setReady(true);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    writeJSON(StorageKeys.themeMode, next);
  }, []);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      setMode,
      ready,
    }),
    [mode, isDark, setMode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

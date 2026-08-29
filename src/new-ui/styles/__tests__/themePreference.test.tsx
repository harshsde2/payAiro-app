import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Appearance } from 'react-native';

const store: Record<string, string> = {};
jest.mock('../../../storage/mmkv', () => ({
  STORAGE_KEYS: { APPEARANCE_PREFERENCE: 'appearance_preference' },
  getItem: (k: string) => store[k],
  setItem: (k: string, v: string) => {
    store[k] = v;
  },
}));

import {
  ThemeProvider,
  useTheme,
  resolveThemeWithoutProvider,
} from '../ThemeContext';
import type { IThemeContext } from '../ThemeContext/types';

/** Renders the provider and hands back the live context value. */
const mountTheme = () => {
  const seen: { current: IThemeContext | null } = { current: null };
  const Probe = () => {
    seen.current = useTheme();
    return null;
  };
  act(() => {
    TestRenderer.create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
  });
  return seen;
};

describe('appearance preference', () => {
  let listener: ((p: { colorScheme: 'light' | 'dark' }) => void) | null;
  const appearance = Appearance as any;

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    listener = null;
    jest.spyOn(appearance, 'getColorScheme').mockReturnValue('light');
    jest.spyOn(appearance, 'addChangeListener').mockImplementation((cb: any) => {
      listener = cb;
      return { remove: () => { listener = null; } };
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('defaults to following the system on a fresh install', () => {
    const t = mountTheme();
    expect(t.current!.themePreference).toBe('system');
    expect(t.current!.isSystemTheme).toBe(true);
    expect(t.current!.themeMode).toBe('light');
  });

  it('resolves the system scheme when the device is dark', () => {
    appearance.getColorScheme.mockReturnValue('dark');
    const t = mountTheme();
    expect(t.current!.themeMode).toBe('dark');
    expect(t.current!.theme.isDark).toBe(true);
    expect(t.current!.theme.colors.background).toBe('#000000');
  });

  it('applies and persists an explicit choice', () => {
    const t = mountTheme();
    act(() => t.current!.setThemeMode('dark'));

    expect(t.current!.themeMode).toBe('dark');
    expect(t.current!.isSystemTheme).toBe(false);
    expect(JSON.parse(store.appearance_preference)).toEqual({ preference: 'dark' });
  });

  it('restores the persisted choice on the next launch', () => {
    store.appearance_preference = JSON.stringify({ preference: 'dark' });
    const t = mountTheme();
    // Device is light, but the user's explicit Dark choice must win.
    expect(t.current!.themeMode).toBe('dark');
    expect(t.current!.isSystemTheme).toBe(false);
  });

  it('follows OS changes while on System', () => {
    const t = mountTheme();
    expect(t.current!.themeMode).toBe('light');

    act(() => listener!({ colorScheme: 'dark' }));
    expect(t.current!.themeMode).toBe('dark');
  });

  it('ignores OS changes once the user has chosen a mode', () => {
    const t = mountTheme();
    act(() => t.current!.setThemeMode('light'));
    // Subscription is torn down when the preference stops being 'system'.
    expect(listener).toBeNull();
    expect(t.current!.themeMode).toBe('light');
  });

  it('falls back to system when the stored value is corrupt', () => {
    store.appearance_preference = '{not json';
    const t = mountTheme();
    expect(t.current!.themePreference).toBe('system');
  });

  it('resolves a theme without the provider, for the crash screen', () => {
    store.appearance_preference = JSON.stringify({ preference: 'dark' });
    expect(resolveThemeWithoutProvider().isDark).toBe(true);
  });
});

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceBorder: string;
  accent: string;
  accentDim: string;
  orange: string;
  orangeDim: string;
  warning: string;
  warningDim: string;
  danger: string;
  dangerDim: string;
  blue: string;
  blueDim: string;
  text: string;
  textSecondary: string;
  textDim: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
};

const DarkColors: ThemeColors = {
  background: '#0A0E1A',
  surface: 'rgba(255,255,255,0.06)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
  accent: '#00D26A',
  accentDim: 'rgba(0,210,106,0.15)',
  orange: '#FF6B35',
  orangeDim: 'rgba(255,107,53,0.15)',
  warning: '#FFB800',
  warningDim: 'rgba(255,184,0,0.15)',
  danger: '#FF4757',
  dangerDim: 'rgba(255,71,87,0.15)',
  blue: '#4A90E2',
  blueDim: 'rgba(74,144,226,0.15)',
  text: '#FFFFFF',
  textSecondary: '#8A92A3',
  textDim: 'rgba(255,255,255,0.5)',
  tabBar: '#0D1320',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.07)',
};

const LightColors: ThemeColors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceBorder: 'rgba(0,0,0,0.08)',
  accent: '#00B85A',
  accentDim: 'rgba(0,184,90,0.12)',
  orange: '#E85D2F',
  orangeDim: 'rgba(232,93,47,0.12)',
  warning: '#D49A00',
  warningDim: 'rgba(212,154,0,0.12)',
  danger: '#E0334A',
  dangerDim: 'rgba(224,51,74,0.12)',
  blue: '#2B6CB0',
  blueDim: 'rgba(43,108,176,0.12)',
  text: '#0A0E1A',
  textSecondary: '#5A6270',
  textDim: 'rgba(10,14,26,0.5)',
  tabBar: '#FFFFFF',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  inputBg: 'rgba(0,0,0,0.05)',
};

type ThemeMode = 'dark' | 'light';

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: DarkColors,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'naija_academy_theme';

function getStoredTheme(): ThemeMode {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    }
  } catch {}
  return 'dark';
}

function saveTheme(mode: ThemeMode) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    setMode(getStoredTheme());
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark: mode === 'dark', colors: mode === 'dark' ? DarkColors : LightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

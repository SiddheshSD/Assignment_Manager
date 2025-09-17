import React, { createContext, useContext } from 'react';

export const lightPalette = {
  background: '#e6e6e6',
  surface: '#f0f0f3',
  textPrimary: '#111827',
  textSecondary: '#374151',
  accent: '#6366f1',
};

export const darkPalette = {
  background: '#0f172a',
  surface: '#111827',
  textPrimary: '#e5e7eb',
  textSecondary: '#94a3b8',
  accent: '#818cf8',
};

export const ThemeContext = createContext({
  mode: 'light',
  palette: lightPalette,
  setMode: () => {},
});

export const useThemePalette = () => useContext(ThemeContext).palette;








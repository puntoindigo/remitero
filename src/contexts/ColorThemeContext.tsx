"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorTheme = 'blue' | 'violet' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  gradient: string;
  background: string;
  buttonHover: string;
}

export const THEME_CONFIGS: Record<ColorTheme, ThemeColors> = {
  blue: {
    primary: '#0078d4',
    secondary: '#005a9e',
    gradient: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
    background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
    buttonHover: '#0066b3',
  },
  violet: {
    primary: '#667eea',
    secondary: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    buttonHover: '#5568d3',
  },
  dark: {
    primary: '#374151',
    secondary: '#4b5563',
    gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    buttonHover: '#4b5563',
  },
};

interface ColorThemeContextType {
  theme: ColorTheme;
  colors: ThemeColors;
  setTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  // Siempre inicializar con 'blue' para evitar mismatch de hidratación
  const [theme, setThemeState] = useState<ColorTheme>('blue');
  const [isMounted, setIsMounted] = useState(false);

  // Cargar tema desde localStorage después del mount
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedTheme && THEME_CONFIGS[savedTheme]) {
      setThemeState(savedTheme);
      const colors = THEME_CONFIGS[savedTheme];
      document.documentElement.style.setProperty('--theme-primary', colors.primary);
      document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
      document.documentElement.style.setProperty('--theme-gradient', colors.gradient);
      document.documentElement.style.setProperty('--theme-button-hover', colors.buttonHover);
    } else {
      // Aplicar tema default
      const colors = THEME_CONFIGS['blue'];
      document.documentElement.style.setProperty('--theme-primary', colors.primary);
      document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
      document.documentElement.style.setProperty('--theme-gradient', colors.gradient);
      document.documentElement.style.setProperty('--theme-button-hover', colors.buttonHover);
      document.documentElement.style.setProperty('--theme-topbar-color', '#0066b3');
    }
  }, []);

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('colorTheme', newTheme);
      // Aplicar variables CSS para el tema
      const colors = THEME_CONFIGS[newTheme];
      document.documentElement.style.setProperty('--theme-primary', colors.primary);
      document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
      document.documentElement.style.setProperty('--theme-gradient', colors.gradient);
      document.documentElement.style.setProperty('--theme-button-hover', colors.buttonHover);
      // Color para topbar (más oscuro que el header)
      const topbarColor = newTheme === 'blue' 
        ? '#0066b3' 
        : newTheme === 'violet'
        ? '#5568d3'
        : '#4b5563';
      document.documentElement.style.setProperty('--theme-topbar-color', topbarColor);
    }
  };

  // Aplicar tema cuando cambia (solo después del mount)
  useEffect(() => {
    if (!isMounted) return;
    const colors = THEME_CONFIGS[theme];
    document.documentElement.style.setProperty('--theme-primary', colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
    document.documentElement.style.setProperty('--theme-gradient', colors.gradient);
    document.documentElement.style.setProperty('--theme-button-hover', colors.buttonHover);
    // Color para topbar (más oscuro que el header)
    const topbarColor = theme === 'blue' 
      ? '#0066b3' 
      : theme === 'violet'
      ? '#5568d3'
      : '#4b5563';
    document.documentElement.style.setProperty('--theme-topbar-color', topbarColor);
  }, [theme, isMounted]);

  const colors = THEME_CONFIGS[theme];

  return (
    <ColorThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}


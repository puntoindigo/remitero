"use client";

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'classic' | 'modern';

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  cssFile: string;
  preview: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
  classic: {
    name: 'classic',
    displayName: 'Clásico',
    description: 'Tema tradicional con colores corporativos',
    cssFile: '/styles/themes/classic.css',
    preview: '🎨'
  },
  modern: {
    name: 'modern',
    displayName: 'Moderno',
    description: 'Tema moderno inspirado en apps líderes',
    cssFile: '/styles/themes/modern.css',
    preview: '✨'
  }
};

export interface UseThemeReturn {
  currentTheme: Theme;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isThemeLoaded: boolean;
}

export function useTheme(): UseThemeReturn {
  const [currentTheme, setCurrentThemeState] = useState<Theme>('classic');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentThemeState(savedTheme);
    }
    setIsThemeLoaded(true);
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    if (!isThemeLoaded) return;

    // Remover temas anteriores
    const existingThemeLinks = document.querySelectorAll('link[data-theme]');
    existingThemeLinks.forEach(link => link.remove());

    // Agregar nuevo tema
    const themeConfig = THEMES[currentTheme];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = themeConfig.cssFile;
    link.setAttribute('data-theme', currentTheme);
    
    // Aplicar clase al body para CSS específico del tema
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${currentTheme}, []`);

    document.head.appendChild(link);

    // Guardar en localStorage
    localStorage.setItem('theme', currentTheme);

    return () => {
      // Cleanup al desmontar
      const themeLinks = document.querySelectorAll('link[data-theme]');
      themeLinks.forEach(link => link.remove());
    };
  }, [currentTheme, isThemeLoaded]);

  const setTheme = useCallback((theme: Theme) => {
    if (THEMES[theme]) {
      setCurrentThemeState(theme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = currentTheme === 'classic' ? 'modern' : 'classic';
    setTheme(nextTheme);
  }, [currentTheme, setTheme]);

  const availableThemes = Object.values(THEMES);
  const themeConfig = THEMES[currentTheme];

  return {
    currentTheme,
    themeConfig,
    availableThemes,
    setTheme,
    toggleTheme,
    isThemeLoaded
  };
}

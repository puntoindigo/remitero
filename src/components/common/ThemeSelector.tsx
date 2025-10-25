"use client";

import React, { useState } from 'react';
import { useTheme, Theme } from '@/hooks/useTheme';
import { Palette, Check, ChevronDown } from 'lucide-react';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown' | 'compact';
}

export function ThemeSelector({ 
  className = '', 
  showLabel = true, 
  variant = 'dropdown' 
}: ThemeSelectorProps) {
  const { currentTheme, themeConfig, availableThemes, setTheme, isThemeLoaded } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!isThemeLoaded) {
    return (
      <div className={`theme-selector-loading ${className}`}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setIsOpen(false);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={() => setTheme(currentTheme === 'classic' ? 'modern' : 'classic')}
        className={`btn secondary theme-toggle ${className}`}
        title={`Cambiar a tema ${currentTheme === 'classic' ? 'moderno' : 'clásico'}`}
      >
        <Palette className="h-4 w-4" />
        {showLabel && (
          <span className="ml-2">
            {currentTheme === 'classic' ? 'Moderno' : 'Clásico'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`theme-selector-compact ${className}`}>
        <button
          onClick={() => setTheme(currentTheme === 'classic' ? 'modern' : 'classic')}
          className="btn secondary"
          title={`Cambiar a tema ${currentTheme === 'classic' ? 'moderno' : 'clásico'}`}
        >
          {themeConfig.preview}
        </button>
      </div>
    );
  }

  return (
    <div className={`theme-selector-dropdown ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn secondary flex items-center gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="h-4 w-4" />
        {showLabel && (
          <>
            <span>{themeConfig.displayName}</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                Seleccionar Tema
              </div>
              
              {availableThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name as Theme)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    currentTheme === theme.name
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-lg">{theme.preview}</span>
                  <div className="flex-1">
                    <div className="font-medium">{theme.displayName}</div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                  {currentTheme === theme.name && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

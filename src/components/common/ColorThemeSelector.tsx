"use client";

import React, { useState } from 'react';
import { useColorTheme, ColorTheme, THEME_CONFIGS } from '@/contexts/ColorThemeContext';
import { Palette } from 'lucide-react';

export default function ColorThemeSelector() {
  const { theme, setTheme } = useColorTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.5rem',
    }}>
      {isExpanded && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.2s ease-out',
        }}>
          {(['blue', 'violet', 'dark'] as ColorTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setIsExpanded(false);
              }}
              title={t === 'blue' ? 'Tema Azul' : t === 'violet' ? 'Tema Violeta' : 'Tema Oscuro'}
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                border: theme === t ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                background: THEME_CONFIGS[t].gradient,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: theme === t ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (theme !== t) {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== t) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
          ))}
        </div>
      )}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background: isExpanded ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = isExpanded ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.75)';
        }}
        title="Cambiar tema"
      >
        <Palette className="h-4 w-4" />
      </button>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


"use client";

import React from 'react';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface GlobalLoadingOverlayProps {
  isLoading?: boolean;
  message?: string;
}

export function GlobalLoadingOverlay({ 
  isLoading: externalLoading,
  message: externalMessage 
}: GlobalLoadingOverlayProps) {
  const { colors } = useColorTheme();

  // OPTIMIZADO: Solo usar props externas, sin estado interno
  const isLoading = externalLoading ?? false;
  const displayMessage = externalMessage || 'Cargando...';

  if (!isLoading) return null;

  return (
    <>
      {/* Overlay con fondo semitransparente */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // OPTIMIZADO: Sin animación para carga instantánea
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.1s ease-out',
        }}
      >
        {/* Contenedor del spinner y mensaje */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '1rem',
            padding: '2rem 2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            minWidth: '280px',
            maxWidth: '90vw',
            // OPTIMIZADO: Sin animación para carga instantánea
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              border: `4px solid #e5e7eb`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />

          {/* Mensaje */}
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: '#1f2937',
              textAlign: 'center',
            }}
          >
            {displayMessage}
          </div>
        </div>
      </div>

      {/* Estilos de animación */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}


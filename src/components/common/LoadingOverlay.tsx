"use client";

import React from 'react';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  className?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = 'Cargando...',
  progress,
  className = '',
  showProgress = false,
  size = 'md',
  fullScreen = true
}: LoadingOverlayProps) {
  const { colors } = useColorTheme();

  if (!isLoading) return null;

  const sizeClasses = {
    sm: { width: '1rem', height: '1rem', borderWidth: '2px' },
    md: { width: '2rem', height: '2rem', borderWidth: '3px' },
    lg: { width: '3.5rem', height: '3.5rem', borderWidth: '4px' }
  };

  const spinnerSize = sizeClasses[size];

  const overlayStyle: React.CSSProperties = {
    position: fullScreen ? 'fixed' : 'absolute',
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
    animation: 'fadeIn 0.2s ease-in-out',
  };

  return (
    <>
      <div style={overlayStyle} className={className}>
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
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: spinnerSize.width,
              height: spinnerSize.height,
              border: `${spinnerSize.borderWidth} solid #e5e7eb`,
              borderTop: `${spinnerSize.borderWidth} solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          
          {/* Message */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '1rem', 
              fontWeight: 500, 
              color: '#1f2937',
              margin: 0 
            }}>
              {message}
            </p>
          </div>
          
          {/* Progress Bar */}
          {showProgress && progress !== undefined && (
            <div style={{ width: '100%', marginTop: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginBottom: '0.5rem' 
              }}>
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '9999px', 
                height: '0.5rem' 
              }}>
                <div 
                  style={{ 
                    backgroundColor: colors.primary,
                    height: '100%',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease-out',
                    width: `${Math.min(100, Math.max(0, progress))}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estilos de animación */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

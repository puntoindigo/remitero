"use client";

import { useEffect, useState } from 'react';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface AppPreloaderProps {
  onComplete?: () => void;
}

/**
 * Preloader que muestra progreso durante la compilación inicial de la aplicación
 * Detecta cuando Next.js está compilando y muestra un indicador visual
 */
export function AppPreloader({ onComplete }: AppPreloaderProps) {
  const { colors } = useColorTheme();
  const [progress, setProgress] = useState(0);
  const [isCompiling, setIsCompiling] = useState(true);
  const [message, setMessage] = useState('Compilando aplicación...');

  useEffect(() => {
    // Detectar cuando Next.js está compilando
    let currentProgress = 0;
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;
    let readyCheckInterval: NodeJS.Timeout;
    let isComplete = false;

    // Detectar compilación de HMR (Hot Module Replacement)
    const detectHMRCompilation = () => {
      if (typeof window === 'undefined') return false;
      
      // Verificar si hay mensajes de HMR en la consola o eventos de compilación
      const webpackHotUpdate = (window as any).__webpack_require__?.cache;
      const nextHotUpdate = (window as any).__NEXT_DATA__?.buildId;
      
      // Verificar si hay eventos de Fast Refresh activos
      const hasCompilationEvents = typeof window !== 'undefined' && 
        (window as any).__NEXT_HMR_PORT__ !== undefined;
      
      return hasCompilationEvents || webpackHotUpdate || nextHotUpdate;
    };

    // Función para completar el preloader
    const complete = () => {
      if (isComplete) return;
      isComplete = true;
      
      setProgress(100);
      setMessage('¡Listo!');
      
      setTimeout(() => {
        setIsCompiling(false);
        if (progressInterval) clearInterval(progressInterval);
        if (messageInterval) clearInterval(messageInterval);
        if (readyCheckInterval) clearInterval(readyCheckInterval);
        onComplete?.();
      }, 300);
    };

    // Simular progreso durante compilación
    progressInterval = setInterval(() => {
      if (!isComplete && currentProgress < 85) {
        // Incremento más conservador para que no se complete demasiado rápido
        const increment = Math.random() * 8 + 2; // Entre 2 y 10
        currentProgress = Math.min(currentProgress + increment, 85);
        setProgress(currentProgress);
      }
    }, 250);

    // Mensajes durante la compilación
    const messages = [
      'Compilando aplicación...',
      'Optimizando componentes...',
      'Preparando rutas...',
      'Cargando módulos...',
      'Casi listo...',
    ];
    
    let messageIndex = 0;
    messageInterval = setInterval(() => {
      if (!isComplete && messageIndex < messages.length - 1) {
        messageIndex++;
        setMessage(messages[messageIndex]);
      }
    }, 2000);

    // Detectar cuando la compilación termina
    const checkReady = () => {
      if (isComplete) return;
      
      // Verificar si la página está completamente cargada
      if (document.readyState === 'complete') {
        // Verificar que no hay compilación activa
        if (!detectHMRCompilation()) {
          // Esperar un poco más para asegurar que todo está listo
          setTimeout(() => {
            if (!isComplete) {
              complete();
            }
          }, 800);
        }
      }
    };

    // Verificar periódicamente si está listo
    readyCheckInterval = setInterval(checkReady, 200);

    // Escuchar el evento de carga
    const handleLoad = () => {
      setTimeout(() => {
        if (!isComplete) {
          complete();
        }
      }, 800);
    };

    window.addEventListener('load', handleLoad);

    // También verificar inmediatamente si ya está listo
    if (document.readyState === 'complete') {
      setTimeout(() => {
        if (!isComplete && !detectHMRCompilation()) {
          complete();
        }
      }, 1000);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (messageInterval) clearInterval(messageInterval);
      if (readyCheckInterval) clearInterval(readyCheckInterval);
      window.removeEventListener('load', handleLoad);
    };
  }, [onComplete]);

  if (!isCompiling) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
      }}
    >
      {/* Logo o título de la app */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: colors.primary,
            marginBottom: '0.5rem',
          }}
        >
          Remitero
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
          }}
        >
          Sistema de Gestión de Remitos
        </p>
      </div>

      {/* Spinner animado */}
      <div
        style={{
          width: '4rem',
          height: '4rem',
          border: `4px solid #e5e7eb`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Mensaje */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 500,
          color: '#1f2937',
          textAlign: 'center',
          minHeight: '1.5rem',
        }}
      >
        {message}
      </div>

      {/* Barra de progreso */}
      <div
        style={{
          width: '300px',
          maxWidth: '90vw',
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: '2px',
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>

      {/* Porcentaje */}
      <div
        style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          fontWeight: 500,
        }}
      >
        {Math.round(progress)}%
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
    </div>
  );
}


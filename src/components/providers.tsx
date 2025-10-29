"use client";

import React, { useEffect } from "react";

// Función para verificar si un error debe ser ignorado
function shouldIgnoreError(error: any): boolean {
  // Si es un Event, probablemente es un error de recurso
  if (error instanceof Event) {
    const eventTarget = (error as any).target;
    
    // Ignorar errores de recursos estáticos
    if (eventTarget?.tagName === 'LINK' || 
        eventTarget?.tagName === 'IMG' || 
        eventTarget?.tagName === 'SCRIPT' ||
        eventTarget?.tagName === 'STYLE') {
      return true;
    }
    
    // Ignorar todos los Events de error (son errores de recursos/red)
    return true;
  }
  
  // Si es un Error, verificar si es un error de red
  if (error instanceof Error) {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Load failed') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('ERR_CONNECTION_RESET')) {
      return true;
    }
  }
  
  // Si el mensaje es "[object Event]", ignorarlo
  if (error && typeof error.toString === 'function' && error.toString().includes('[object Event]')) {
    return true;
  }
  
  return false;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Manejador global de errores de promesas no capturadas
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldIgnoreError(event.reason)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Para errores reales, loguear información útil
      if (event.reason instanceof Error) {
        console.error('Unhandled promise rejection:', {
          message: event.reason.message,
          stack: event.reason.stack?.substring(0, 500)
        });
      } else {
        console.error('Unhandled promise rejection:', event.reason);
      }
      
      // Aún así prevenir el comportamiento por defecto para no romper la UI
      event.preventDefault();
      event.stopPropagation();
    };

    // Manejador para errores globales sincrónicos
    const handleError = (event: ErrorEvent) => {
      if (shouldIgnoreError(event.error)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // Para errores reales, loguear pero no romper la UI
      console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      event.preventDefault();
      event.stopPropagation();
    };

    // Registrar manejadores con capture: true para interceptar temprano
    window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    window.addEventListener('error', handleError, { capture: true });
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
      window.removeEventListener('error', handleError, { capture: true });
    };
  }, []);

  return <>{children}</>;
}

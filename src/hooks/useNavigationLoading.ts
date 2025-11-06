"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface UseNavigationLoadingReturn {
  isLoading: boolean;
  setLoading: (loading: boolean, message?: string) => void;
  message: string;
  navigateWithLoading: (path: string, message?: string) => void;
}

/**
 * Hook para manejar estados de carga durante navegaciones
 */
export function useNavigationLoading(): UseNavigationLoadingReturn {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Cargando...');
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);

  // Detectar cambios de ruta automáticamente
  // OPTIMIZADO: Sin delay mínimo - ocultar inmediatamente cuando la página está lista
  useEffect(() => {
    if (previousPathname && previousPathname !== pathname) {
      setIsLoading(true);
      
      // Ocultar inmediatamente - Next.js ya maneja la transición
      // Solo mostrar loading si realmente hay una demora (más de 100ms)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 50); // Reducido a 50ms - solo para evitar parpadeos mínimos

      return () => clearTimeout(timer);
    }

    // Inicializar la ruta anterior si es la primera vez
    if (!previousPathname) {
      setPreviousPathname(pathname);
    }
  }, [pathname, previousPathname]);

  const setLoading = useCallback((loading: boolean, customMessage?: string) => {
    setIsLoading(loading);
    if (customMessage) {
      setMessage(customMessage);
    }
  }, []);

  const navigateWithLoading = useCallback((path: string, customMessage?: string) => {
    setIsLoading(true);
    if (customMessage) {
      setMessage(customMessage);
    } else {
      setMessage('Cargando...');
    }
    router.push(path);
  }, [router]);

  return {
    isLoading,
    setLoading,
    message,
    navigateWithLoading
  };
}


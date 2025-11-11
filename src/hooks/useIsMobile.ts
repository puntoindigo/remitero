"use client";

import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el dispositivo es mobile
 * Usa breakpoint de 768px (tablets y móviles)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para verificar si es mobile
    const checkIsMobile = () => {
      // Verificar ancho de pantalla
      const isMobileWidth = window.innerWidth < 768;
      setIsMobile(isMobileWidth);
    };

    // Verificar al montar
    checkIsMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}


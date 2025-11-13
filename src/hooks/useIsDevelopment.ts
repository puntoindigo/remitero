"use client";

import { useMemo } from 'react';

/**
 * Hook para detectar si estamos en un entorno de desarrollo
 * Funciona tanto en cliente como en servidor (usando window.location en cliente)
 */
export function useIsDevelopment(): boolean {
  return useMemo(() => {
    if (typeof window !== 'undefined') {
      // Cliente: verificar hostname
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname.includes('remitero-dev');
    }
    // Servidor: esto no debería ejecutarse en un hook del cliente, pero por si acaso
    return false;
  }, []);
}


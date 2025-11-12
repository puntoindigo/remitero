"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * Hook para hacer warm-up de APIs críticas en background
 * DESHABILITADO: Causaba requests innecesarios que ralentizaban la navegación
 * Solo se activará si es realmente necesario en el futuro
 */
export function useApiWarmup() {
  // Deshabilitado temporalmente - causaba requests innecesarios
  // const { data: session, status } = useSession();
  // const pathname = usePathname();
  // const hasWarmedUp = useRef(false);

  // useEffect(() => {
  //   // Solo warm-up una vez después de que la navegación inicial esté completa
  //   if (status !== 'authenticated' || !session?.user || hasWarmedUp.current) return;
  //   
  //   // Esperar 10 segundos después del login para no interferir con la navegación inicial
  //   const timer = setTimeout(() => {
  //     hasWarmedUp.current = true;
  //     // Warm-up solo de APIs realmente críticas y solo una vez
  //   }, 10000);
  //   
  //   return () => clearTimeout(timer);
  // }, [session, status, pathname]);
  
  // Hook vacío - no hace nada por ahora
  return;
}


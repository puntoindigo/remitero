"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// DevTools removido - carga innecesaria en producción/desarrollo
import { useState } from 'react';
import { GlobalLoadingIndicator } from '@/components/common/GlobalLoadingIndicator';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración de cache y refetch optimizada
        staleTime: 60 * 1000, // Los datos son "frescos" por 1 minuto
        gcTime: 5 * 60 * 1000, // Garbage collection después de 5 minutos
        refetchOnWindowFocus: false, // No refetch al cambiar de ventana (mejora performance)
        refetchOnMount: true, // Refetch al montar el componente si los datos están stale
        retry: 1, // Reintentar 1 vez en caso de error
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 0, // No reintentar mutaciones
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingIndicator />
      {children}
      {/* DevTools removido para mejorar performance */}
    </QueryClientProvider>
  );
}


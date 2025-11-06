"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// DevTools removido - carga innecesaria en producción/desarrollo
import { useState } from 'react';
import { GlobalLoadingIndicator } from '@/components/common/GlobalLoadingIndicator';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Caché optimizado: los datos son "frescos" por 10 minutos (aumentado para mejor performance)
        staleTime: 10 * 60 * 1000, // 10 minutos
        gcTime: 30 * 60 * 1000, // Garbage collection después de 30 minutos (aumentado para mantener caché más tiempo)
        // No refetch automático - solo cuando se invalida explícitamente
        refetchOnWindowFocus: false, // No refetch al cambiar de ventana
        refetchOnMount: false, // Usar caché si está disponible
        refetchOnReconnect: false, // No refetch al reconectar
        // Retry inteligente: solo reintentar errores de red
        retry: (failureCount, error: any) => {
          // No reintentar errores 4xx (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Mutaciones: solo retry en errores de red
        retry: (failureCount, error: any) => {
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 1;
        },
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


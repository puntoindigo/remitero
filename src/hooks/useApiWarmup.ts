"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook para hacer warm-up de APIs críticas en background
 * Esto pre-compila las rutas de API y las mantiene listas
 */
export function useApiWarmup() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Solo warm-up si hay sesión válida
    if (status !== 'authenticated' || !session?.user) return;

    const userRole = session.user.role;
    const companyId = session.user.companyId;

    // APIs críticas a hacer warm-up
    const criticalApis = [
      '/api/dashboard',
      '/api/products',
      '/api/clients',
      '/api/remitos',
      '/api/categories',
    ];

    // Solo SUPERADMIN puede ver estas APIs
    if (userRole === 'SUPERADMIN' || userRole === 'ADMIN') {
      criticalApis.push('/api/users');
      criticalApis.push('/api/estados-remitos');
    }

    // Warm-up en background usando requestIdleCallback
    const warmupApis = () => {
      criticalApis.forEach((api) => {
        try {
          // Construir URL con parámetros si es necesario
          let url = api;
          if (companyId && !api.includes('companyId')) {
            url += `?companyId=${companyId}`;
          }

          // Hacer un HEAD request para warm-up (más ligero que GET)
          fetch(url, {
            method: 'HEAD',
            credentials: 'include',
          }).catch(() => {
            // Silenciar errores - esto es solo warm-up
          });
        } catch (error) {
          // Silenciar errores
          console.debug(`API warm-up failed for ${api}:`, error);
        }
      });
    };

    // Warm-up después de un delay más largo para no interferir con la navegación inicial
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(warmupApis, { timeout: 5000 });
    } else {
      setTimeout(warmupApis, 3000);
    }
  }, [session, status]);
}


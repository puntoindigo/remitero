"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook para prefetch de rutas críticas después del login
 * Pre-compila las rutas para que la navegación sea instantánea
 */
export function useRoutePrefetch() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Solo prefetch si hay sesión válida
    if (status !== 'authenticated' || !session?.user) return;

    // Rutas críticas a prefetchear según el rol
    const criticalRoutes = {
      SUPERADMIN: [
        '/dashboard',
        '/empresas',
        '/usuarios',
        '/remitos',
        '/productos',
        '/clientes',
        '/categorias',
        '/estados-remitos',
      ],
      ADMIN: [
        '/dashboard',
        '/remitos',
        '/productos',
        '/clientes',
        '/categorias',
        '/estados-remitos',
      ],
      OPERADOR: [
        '/dashboard',
        '/remitos',
        '/productos',
        '/clientes',
      ],
    };

    const userRole = session.user.role as keyof typeof criticalRoutes;
    const routesToPrefetch = criticalRoutes[userRole] || criticalRoutes.OPERADOR;

    // Prefetch todas las rutas críticas en paralelo
    // Usar requestIdleCallback si está disponible para no bloquear el UI
    const prefetchRoutes = () => {
      routesToPrefetch.forEach((route) => {
        try {
          router.prefetch(route);
        } catch (error) {
          // Silenciar errores de prefetch
          console.debug(`Prefetch failed for ${route}:`, error);
        }
      });
    };

    // Prefetch inmediatamente
    prefetchRoutes();

    // También prefetch en idle para rutas secundarias
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(prefetchRoutes, { timeout: 2000 });
    } else {
      // Fallback: prefetch después de un pequeño delay
      setTimeout(prefetchRoutes, 100);
    }
  }, [router, session, status]);
}


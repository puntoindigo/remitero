"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * Hook para prefetch de rutas críticas después del login
 * OPTIMIZADO: Solo prefetchea rutas relacionadas con la página actual y solo una vez
 */
export function useRoutePrefetch() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Solo prefetch si hay sesión válida y no hemos prefetcheado ya
    if (status !== 'authenticated' || !session?.user || hasPrefetched.current) return;

    // Esperar 5 segundos después del login para no interferir con la navegación inicial
    const timer = setTimeout(() => {
      hasPrefetched.current = true;
      
      // Solo prefetchear rutas relacionadas con la página actual
      const relatedRoutes: string[] = [];
      
      // Prefetchear solo rutas relacionadas con la página actual
      if (pathname.startsWith('/remitos')) {
        relatedRoutes.push('/productos', '/clientes');
      } else if (pathname.startsWith('/productos')) {
        relatedRoutes.push('/remitos', '/categorias');
      } else if (pathname.startsWith('/clientes')) {
        relatedRoutes.push('/remitos');
      }
      
      // Prefetchear solo las rutas relacionadas
      relatedRoutes.forEach((route) => {
        try {
          router.prefetch(route);
        } catch (error) {
          // Silenciar errores de prefetch
        }
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router, session, status, pathname]);
}


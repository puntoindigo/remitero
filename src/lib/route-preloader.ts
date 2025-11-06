/**
 * Pre-genera rutas al iniciar el servidor para mejorar la navegación
 */

const CRITICAL_ROUTES = [
  '/dashboard',
  '/remitos',
  '/productos',
  '/clientes',
  '/categorias',
  '/usuarios',
  '/empresas',
  '/estados-remitos',
];

/**
 * Pre-genera rutas críticas
 * Solo se ejecuta en el servidor
 */
export async function preloadCriticalRoutes() {
  // Solo ejecutar en servidor
  if (typeof window !== 'undefined') {
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:8000';
  
  console.log('🚀 Pre-generando rutas críticas...');
  
  const startTime = Date.now();
  
  // Pre-generar en paralelo con límite de concurrencia
  const batchSize = 3;
  for (let i = 0; i < CRITICAL_ROUTES.length; i += batchSize) {
    const batch = CRITICAL_ROUTES.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (route) => {
        try {
          // Usar fetch interno para pre-generar
          const response = await fetch(`${baseUrl}${route}`, {
            method: 'HEAD',
            headers: {
              'Cache-Control': 'no-cache',
              'User-Agent': 'NextJS-Preloader'
            },
            // Timeout corto para no bloquear
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            console.log(`  ✅ ${route}`);
          }
        } catch (error) {
          // Silenciar errores de pre-generación
        }
      })
    );
    
    // Pequeña pausa entre batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const duration = Date.now() - startTime;
  console.log(`✅ Pre-generación completada en ${duration}ms`);
}

/**
 * Pre-genera una ruta específica
 */
export async function preloadRoute(route: string) {
  if (typeof window !== 'undefined') {
    return;
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:8000';
  
  try {
    await fetch(`${baseUrl}${route}`, {
      method: 'HEAD',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(3000)
    });
  } catch (error) {
    // Silenciar errores
  }
}


/**
 * Script para pre-generar rutas al iniciar el servidor
 * Se ejecuta automáticamente después de que el servidor esté listo
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

async function preloadRoutes() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:8000';
  
  console.log('🚀 Pre-generando rutas críticas...');
  const startTime = Date.now();
  
  // Pre-generar en batches para no sobrecargar
  const batchSize = 3;
  let successCount = 0;
  
  for (let i = 0; i < CRITICAL_ROUTES.length; i += batchSize) {
    const batch = CRITICAL_ROUTES.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (route) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${baseUrl}${route}`, {
            method: 'HEAD',
            headers: {
              'Cache-Control': 'no-cache',
              'User-Agent': 'NextJS-Preloader'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          
          if (response.ok) {
            successCount++;
            console.log(`  ✅ ${route}`);
          }
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      })
    );
    
    // Pequeña pausa entre batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const duration = Date.now() - startTime;
  console.log(`✅ Pre-generación completada: ${successCount}/${CRITICAL_ROUTES.length} rutas en ${duration}ms`);
}

// Esperar a que el servidor esté listo
if (process.env.NODE_ENV === 'development') {
  // En desarrollo, esperar 3 segundos después del inicio
  setTimeout(() => {
    preloadRoutes().catch(console.error);
  }, 3000);
} else {
  // En producción, ejecutar inmediatamente
  preloadRoutes().catch(console.error);
}


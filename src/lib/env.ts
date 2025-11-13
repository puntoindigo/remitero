/**
 * Utilidades para detectar el entorno de ejecución
 * 
 * IMPORTANTE: NODE_ENV en Vercel siempre es 'production' porque indica el modo de ejecución de Node.js,
 * no el entorno de despliegue. Para detectar el entorno de despliegue, usamos VERCEL_ENV o la URL.
 */

/**
 * Determina si estamos en un entorno de desarrollo/preview
 * - Localhost: siempre es desarrollo
 * - Vercel Preview/Development: VERCEL_ENV !== 'production' o URL contiene 'remitero-dev'
 * - Vercel Production: VERCEL_ENV === 'production' y URL es de producción
 */
export function isDevelopment(): boolean {
  // En localhost, siempre es desarrollo
  if (typeof window !== 'undefined') {
    // Cliente: verificar hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
  } else {
    // Servidor: verificar variables de entorno
    // Localhost en servidor
    if (!process.env.VERCEL_URL && !process.env.VERCEL) {
      return true;
    }
  }

  // En Vercel, verificar VERCEL_ENV
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'preview' || vercelEnv === 'development') {
    return true;
  }
  if (vercelEnv === 'production') {
    return false;
  }

  // Si VERCEL_ENV no está configurado, verificar por URL
  const vercelUrl = process.env.VERCEL_URL || '';
  const isDevelopmentUrl = vercelUrl.includes('remitero-dev.vercel.app') ||
                          vercelUrl.includes('remitero-git-') ||
                          vercelUrl.includes('-puntoindigo.vercel.app');
  
  if (isDevelopmentUrl) {
    return true;
  }

  // Si no podemos determinar, asumir producción (más seguro)
  return false;
}

/**
 * Determina si estamos en producción
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Obtiene el entorno actual como string
 */
export function getEnvironment(): 'development' | 'preview' | 'production' {
  if (isDevelopment()) {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv === 'preview') {
      return 'preview';
    }
    return 'development';
  }
  return 'production';
}


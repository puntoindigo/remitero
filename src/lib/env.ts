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
 * - Vercel Production: VERCEL_ENV === 'production' o URL es de producción (v0-remitero.vercel.app)
 */
export function isDevelopment(): boolean {
  // En localhost, siempre es desarrollo
  if (typeof window !== 'undefined') {
    // Cliente: verificar hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    // Si la URL contiene 'remitero-dev', es desarrollo
    if (hostname.includes('remitero-dev')) {
      return true;
    }
    // Si la URL es de producción (v0-remitero.vercel.app), es producción
    if (hostname.includes('v0-remitero.vercel.app')) {
      return false;
    }
  } else {
    // Servidor: verificar variables de entorno
    // Localhost en servidor
    if (!process.env.VERCEL_URL && !process.env.VERCEL) {
      return true;
    }
    
    // Verificar URL de Vercel (múltiples variables posibles)
    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || '';
    
    // Verificar VERCEL_ENV primero (más confiable)
    const vercelEnv = process.env.VERCEL_ENV;
    
    // Si VERCEL_ENV es 'production', es producción (definitivo)
    if (vercelEnv === 'production') {
      return false;
    }
    
    // Si VERCEL_ENV es 'preview' o 'development', es desarrollo
    if (vercelEnv === 'preview' || vercelEnv === 'development') {
      return true;
    }
    
    // Si la URL contiene 'remitero-dev', es desarrollo
    if (vercelUrl.includes('remitero-dev')) {
      return true;
    }
    
    // Si la URL es de producción (v0-remitero.vercel.app), es producción
    if (vercelUrl.includes('v0-remitero.vercel.app')) {
      return false;
    }
    
    // Si estamos en Vercel (process.env.VERCEL existe) pero no hay VERCEL_ENV configurado,
    // y la URL no contiene 'remitero-dev', asumir producción por defecto
    // (más seguro que asumir desarrollo - en producción no queremos mostrar "entorno desarrollo")
    if (process.env.VERCEL) {
      // Si estamos en Vercel y no es explícitamente desarrollo, asumir producción
      return false;
    }
  }

  // Por defecto, si no podemos determinar, asumir desarrollo solo en localhost
  // En cualquier otro caso (Vercel sin configuración clara), asumir producción
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


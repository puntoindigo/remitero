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
    
    // Verificar URL de Vercel
    const vercelUrl = process.env.VERCEL_URL || '';
    if (vercelUrl.includes('remitero-dev')) {
      return true;
    }
    // Si la URL es de producción (v0-remitero.vercel.app), es producción
    if (vercelUrl.includes('v0-remitero.vercel.app')) {
      return false;
    }
  }

  // En Vercel, usar VERCEL_ENV para determinar el entorno
  // VERCEL_ENV === 'production' → producción
  // VERCEL_ENV no existe, es 'preview', 'development', o cualquier otro valor → desarrollo
  const vercelEnv = process.env.VERCEL_ENV;
  
  // Solo es producción si VERCEL_ENV está explícitamente configurado como 'production'
  if (vercelEnv === 'production') {
    return false;
  }
  
  // Cualquier otro caso (no existe, preview, development, etc.) es desarrollo
  return true;
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


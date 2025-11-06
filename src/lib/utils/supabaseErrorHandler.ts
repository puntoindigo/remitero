/**
 * Utilidades para manejar errores de Supabase de forma consistente
 */

export interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

/**
 * Convierte un error de Supabase a un mensaje amigable para el usuario
 */
export function formatSupabaseError(error: any): string {
  // Si es un error de red/conexión
  if (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
    error?.message?.includes('ERR_CONNECTION_RESET') ||
    error?.message?.includes('ERR_NETWORK_CHANGED') ||
    error?.code === 'PGRST301' // Supabase: Connection error
  ) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  // Si es un timeout
  if (
    error?.message?.includes('timeout') ||
    error?.message?.includes('AbortError') ||
    error?.code === 'PGRST302' // Supabase: Timeout
  ) {
    return 'La solicitud tardó demasiado. Por favor, intenta nuevamente.';
  }

  // Si es un error de autenticación
  if (
    error?.code === 'PGRST301' ||
    error?.message?.includes('JWT') ||
    error?.message?.includes('Unauthorized') ||
    error?.status === 401
  ) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }

  // Si es un error de permisos
  if (error?.code === 'PGRST116' || error?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  // Si es un error de validación
  if (error?.code === '23505') { // PostgreSQL: Unique violation
    return 'Ya existe un registro con estos datos.';
  }

  if (error?.code === '23503') { // PostgreSQL: Foreign key violation
    return 'No se puede realizar esta acción porque está siendo utilizada en otro lugar.';
  }

  if (error?.code === '23502') { // PostgreSQL: Not null violation
    return 'Faltan datos requeridos.';
  }

  // Si es un error de Supabase específico
  if (error?.message) {
    // Limpiar mensajes técnicos
    const cleanMessage = error.message
      .replace(/^Error: /, '')
      .replace(/^PostgresError: /, '')
      .replace(/^DatabaseError: /, '');
    
    return cleanMessage;
  }

  // Error genérico
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
}

/**
 * Verifica si un error es de red/conexión
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
    error?.message?.includes('ERR_CONNECTION_RESET') ||
    error?.message?.includes('ERR_NETWORK_CHANGED') ||
    error?.code === 'PGRST301' ||
    error?.code === 'PGRST302'
  );
}

/**
 * Verifica si un error es de timeout
 */
export function isTimeoutError(error: any): boolean {
  return (
    error?.message?.includes('timeout') ||
    error?.message?.includes('AbortError') ||
    error?.code === 'PGRST302'
  );
}


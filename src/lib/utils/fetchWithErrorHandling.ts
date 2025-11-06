/**
 * Utilidad para hacer fetch con manejo robusto de errores de red y conexión
 */

export interface FetchError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
}

export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Detectar errores de red
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      const timeoutError: FetchError = new Error('La solicitud tardó demasiado. Verifica tu conexión a internet.');
      timeoutError.name = 'TimeoutError';
      timeoutError.isTimeoutError = true;
      timeoutError.isNetworkError = true;
      throw timeoutError;
    }

    // Detectar errores de conexión
    if (
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message?.includes('ERR_CONNECTION_RESET') ||
      error.message?.includes('ERR_NETWORK_CHANGED')
    ) {
      const networkError: FetchError = new Error('Error de conexión. Verifica tu conexión a internet.');
      networkError.name = 'NetworkError';
      networkError.isNetworkError = true;
      throw networkError;
    }

    // Re-lanzar otros errores
    throw error;
  }
}

/**
 * Wrapper para fetch que maneja errores y retorna un formato consistente
 */
export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<{ data: T; error: null } | { data: null; error: FetchError }> {
  try {
    const response = await fetchWithErrorHandling(url, options, timeout);

    // Si la respuesta no es OK, intentar parsear el error
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no se puede parsear JSON, usar el texto de la respuesta
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Si falla todo, usar el mensaje por defecto
        }
      }

      const error: FetchError = new Error(errorMessage);
      error.status = response.status;
      error.name = 'HttpError';
      
      return { data: null, error };
    }

    // Parsear respuesta JSON
    try {
      const data = await response.json();
      return { data, error: null };
    } catch (parseError) {
      const error: FetchError = new Error('Error al procesar la respuesta del servidor.');
      error.name = 'ParseError';
      return { data: null, error };
    }
  } catch (error: any) {
    // Si es un error de red que ya manejamos, retornarlo
    if (error.isNetworkError || error.isTimeoutError) {
      return { data: null, error };
    }

    // Otros errores
    const fetchError: FetchError = error instanceof Error 
      ? error as FetchError
      : new Error('Error desconocido al realizar la solicitud.');
    
    return { data: null, error: fetchError };
  }
}


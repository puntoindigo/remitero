/**
 * Sistema de caché inteligente que solo actualiza cuando hay cambios
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  private readonly maxCacheSize = 100; // Máximo 100 entradas

  /**
   * Obtiene datos del caché si están disponibles y no han expirado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si ha expirado
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Guarda datos en el caché con timestamp
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Limpiar caché si está lleno (LRU simple)
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      version: this.generateVersion()
    });
  }

  /**
   * Invalida una entrada específica del caché
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalida todas las entradas que coincidan con un patrón
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern.replace('*', '.*')) 
      : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Genera una versión única para tracking de cambios
   */
  private generateVersion(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Verifica si una entrada existe y es válida
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age <= this.defaultTTL;
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

/**
 * Hook para usar el caché con React Query
 */
export function useCacheKey(baseKey: string, params?: Record<string, any>) {
  const key = params 
    ? `${baseKey}:${JSON.stringify(params)}`
    : baseKey;
  
  return key;
}

/**
 * Pre-genera URLs comunes al iniciar el servidor
 */
export async function pregenerateRoutes() {
  if (typeof window !== 'undefined') {
    // Solo en servidor
    return;
  }

  const routes = [
    '/dashboard',
    '/remitos',
    '/productos',
    '/clientes',
    '/categorias',
    '/usuarios',
    '/empresas',
    '/estados-remitos',
  ];

  // Pre-warm las rutas usando fetch interno
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:8000';
    
    await Promise.allSettled(
      routes.map(route => 
        fetch(`${baseUrl}${route}`, {
          method: 'HEAD',
          headers: { 'Cache-Control': 'no-cache' }
        }).catch(() => {
          // Ignorar errores de pre-generación
        })
      )
    );
    
    console.log('✅ Rutas pre-generadas:', routes.length);
  } catch (error) {
    console.warn('⚠️ Error pre-generando rutas:', error);
  }
}


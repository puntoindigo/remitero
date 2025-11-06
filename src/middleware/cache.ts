/**
 * Middleware de caché para API routes
 * Solo actualiza datos cuando detecta cambios
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache-manager';

interface CacheOptions {
  ttl?: number; // Time to live en milisegundos
  key?: string; // Clave personalizada para el caché
  tags?: string[]; // Tags para invalidación en grupo
}

/**
 * Wrapper para API routes que agrega caché inteligente
 */
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (req: NextRequest) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return handler(req);
    }

    const { ttl = 5 * 60 * 1000, key, tags = [] } = options;
    
    // Generar clave de caché
    const cacheKey = key || `${req.nextUrl.pathname}${req.nextUrl.search}`;
    
    // Verificar caché
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      const response = NextResponse.json(cached);
      
      // Headers para indicar que viene del caché
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Cache-Key', cacheKey);
      
      return response;
    }

    // Ejecutar handler
    const response = await handler(req);
    
    // Solo cachear respuestas exitosas
    if (response.status === 200) {
      try {
        const data = await response.clone().json();
        cacheManager.set(cacheKey, data, ttl);
        
        // Guardar tags para invalidación
        tags.forEach(tag => {
          const tagKey = `tag:${tag}`;
          const existing = cacheManager.get<string[]>(tagKey) || [];
          if (!existing.includes(cacheKey)) {
            cacheManager.set(tagKey, [...existing, cacheKey], ttl);
          }
        });
        
        response.headers.set('X-Cache', 'MISS');
      } catch (error) {
        // Si no es JSON, no cachear
        console.warn('No se pudo cachear respuesta:', error);
      }
    }
    
    return response;
  };
}

/**
 * Invalida caché por tag
 */
export function invalidateCacheByTag(tag: string) {
  const tagKey = `tag:${tag}`;
  const keys = cacheManager.get<string[]>(tagKey) || [];
  
  keys.forEach(key => {
    cacheManager.invalidate(key);
  });
  
  cacheManager.invalidate(tagKey);
}

/**
 * Invalida caché por patrón
 */
export function invalidateCachePattern(pattern: string | RegExp) {
  cacheManager.invalidatePattern(pattern);
}


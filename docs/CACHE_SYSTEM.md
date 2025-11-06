# 🚀 Sistema de Caché y Pre-generación de Rutas

## 📋 Resumen

Se ha implementado un sistema completo de caché inteligente y pre-generación de rutas para mejorar significativamente el rendimiento de la navegación.

## ✨ Características Implementadas

### 1. **Caché Inteligente (React Query)**
- **staleTime**: 5 minutos (antes 1 minuto)
- **gcTime**: 10 minutos (antes 5 minutos)
- **No refetch automático**: Solo cuando se invalida explícitamente
- **Retry inteligente**: Solo reintenta errores de red, no errores 4xx

### 2. **Cache Manager**
Sistema de caché en memoria del servidor que:
- Cachea respuestas de API por 5 minutos por defecto
- Invalida automáticamente entradas expiradas
- Soporta invalidación por patrón o tag
- Límite de 100 entradas (LRU)

### 3. **Pre-generación de Rutas**
- Pre-genera rutas críticas al iniciar el servidor
- Reduce el tiempo de primera carga
- Ejecuta en batches para no sobrecargar

### 4. **API de Invalidación de Caché**
Endpoint `/api/cache/invalidate` para:
- Invalidar por clave específica
- Invalidar por patrón
- Invalidar por tag
- Limpiar todo el caché

## 🎯 Uso

### Pre-generar Rutas al Iniciar

```bash
# Opción 1: Usar el script dedicado
npm run dev:preload

# Opción 2: Pre-generar después de iniciar
npm run dev
# En otra terminal, después de 5 segundos:
npm run preload
```

### Invalidar Caché Manualmente

```typescript
// Invalidar por clave
await fetch('/api/cache/invalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'key', key: '/api/dashboard' })
});

// Invalidar por patrón
await fetch('/api/cache/invalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'pattern', pattern: '/api/remitos/*' })
});

// Limpiar todo
await fetch('/api/cache/invalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'all' })
});
```

### Ver Estadísticas del Caché

```typescript
const stats = await fetch('/api/cache/invalidate').then(r => r.json());
console.log(stats);
// { size: 15, maxSize: 100, keys: [...] }
```

## 📊 Rutas Pre-generadas

Las siguientes rutas se pre-generan automáticamente:
- `/dashboard`
- `/remitos`
- `/productos`
- `/clientes`
- `/categorias`
- `/usuarios`
- `/empresas`
- `/estados-remitos`

## 🔧 Configuración

### React Query
La configuración está en `src/providers/QueryProvider.tsx`:
- `staleTime`: 5 minutos
- `gcTime`: 10 minutos
- `refetchOnMount`: false (usa caché si está disponible)
- `refetchOnWindowFocus`: false

### Cache Manager
Configuración en `src/lib/cache-manager.ts`:
- TTL por defecto: 5 minutos
- Tamaño máximo: 100 entradas
- Estrategia: LRU (Least Recently Used)

## 🚀 Beneficios

1. **Navegación más rápida**: Las rutas se cargan instantáneamente desde caché
2. **Menos carga en BD**: Los datos se cachean por 5 minutos
3. **Mejor UX**: Sin pantallas en blanco durante la navegación
4. **Invalidación inteligente**: Solo actualiza cuando hay cambios reales

## 📝 Notas

- El caché se invalida automáticamente después de 5 minutos
- Los datos se actualizan automáticamente cuando React Query detecta cambios
- El preloader solo se ejecuta en desarrollo (no en producción)
- El caché del servidor es independiente del caché de React Query


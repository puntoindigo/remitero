import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Determina el schema de base de datos según el entorno
 * - Production (Vercel): 'public'
 * - Development/Preview: 'dev' (o el valor de DATABASE_SCHEMA)
 * - Localhost: 'dev' por defecto
 * 
 * IMPORTANTE: Esta función debe retornar 'public' SOLO en producción de Vercel
 * Para desarrollo/preview, SIEMPRE debe retornar 'dev'
 */
function getDatabaseSchema(): string {
  // Verificar explícitamente si estamos en producción de Vercel
  const isVercelProduction = process.env.VERCEL_ENV === 'production';
  
  // Si hay DATABASE_SCHEMA explícito, usarlo (pero solo si NO es producción)
  // Esto permite override en preview/development, pero nunca en producción
  if (!isVercelProduction && process.env.DATABASE_SCHEMA) {
    const explicitSchema = process.env.DATABASE_SCHEMA.trim().toLowerCase();
    // Validar que no sea 'public' en desarrollo (seguridad)
    if (explicitSchema === 'public') {
      console.error('❌ [Supabase] ERROR: DATABASE_SCHEMA=public en entorno no-producción. Usando "dev" por seguridad.');
      return 'dev';
    }
    return explicitSchema;
  }
  
  // En producción de Vercel, usar SIEMPRE 'public'
  if (isVercelProduction) {
    return 'public';
  }
  
  // Por defecto, usar 'dev' (desarrollo, preview, localhost)
  return 'dev';
}

const databaseSchema = getDatabaseSchema();

// Log del schema usado (SIEMPRE, para debugging en todos los entornos)
console.log('🗄️ [Supabase] Schema detectado:', databaseSchema, {
  vercelEnv: process.env.VERCEL_ENV || 'not-set',
  databaseSchemaEnv: process.env.DATABASE_SCHEMA || 'not-set',
  vercelUrl: process.env.VERCEL_URL || 'not-set',
  isProduction: process.env.VERCEL_ENV === 'production',
  nodeEnv: process.env.NODE_ENV || 'not-set',
});

// Advertencia crítica si estamos usando 'public' en desarrollo
if (databaseSchema === 'public' && process.env.VERCEL_ENV !== 'production') {
  console.error('❌ [Supabase] ADVERTENCIA CRÍTICA: Usando schema PUBLIC en entorno NO-PRODUCCIÓN!');
  console.error('❌ [Supabase] Esto puede causar que desarrollo y producción compartan datos!');
  console.error('❌ [Supabase] Verifica las variables de entorno VERCEL_ENV y DATABASE_SCHEMA');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para operaciones del servidor (con service role key)
// Optimizaciones de rendimiento:
// - db.schema dinámico según entorno (public para prod, dev para desarrollo)
// - persistSession: false evita guardar sesiones innecesarias
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: databaseSchema, // Schema dinámico según entorno
  },
  // Reducir timeouts para detectar problemas más rápido
  global: {
    headers: {
      'x-client-info': 'remitero-nextjs',
    },
    fetch: (url, options = {}) => {
      // Agregar timeout a las peticiones de Supabase
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
})

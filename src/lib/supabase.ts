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
 */
function getDatabaseSchema(): string {
  // En producción de Vercel, usar siempre 'public'
  if (process.env.VERCEL_ENV === 'production') {
    return 'public';
  }
  
  // En desarrollo/preview, usar 'dev' o el valor de DATABASE_SCHEMA
  // Permite override con variable de entorno
  return process.env.DATABASE_SCHEMA || 'dev';
}

const databaseSchema = getDatabaseSchema();

// Log del schema usado (solo en desarrollo para debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('🗄️ [Supabase] Usando schema:', databaseSchema, {
    vercelEnv: process.env.VERCEL_ENV,
    databaseSchemaEnv: process.env.DATABASE_SCHEMA
  });
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

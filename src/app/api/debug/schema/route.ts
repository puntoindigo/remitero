import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de debug para verificar qué schema está usando la aplicación
 * Útil para verificar que dev y prod están usando schemas diferentes
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener el host desde el request (más confiable que VERCEL_URL)
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const fullUrl = `${protocol}://${host}`;
    
    // Determinar schema según la misma lógica que supabase.ts
    function getDatabaseSchema(hostname: string): string {
      const isVercelProduction = process.env.VERCEL_ENV === 'production';
      const vercelUrl = process.env.VERCEL_URL || '';
      
      // Detectar por hostname del request (más confiable)
      const isProductionByHost = hostname.includes('v0-remitero.vercel.app') || 
                                 hostname.includes('remitero.vercel.app') ||
                                 hostname === 'v0-remitero.vercel.app';
      const isDevelopmentByHost = hostname.includes('remitero-dev.vercel.app') ||
                                 hostname === 'remitero-dev.vercel.app';
      
      // Detectar por VERCEL_URL como respaldo
      const isProductionByUrl = vercelUrl.includes('v0-remitero.vercel.app') || 
                                vercelUrl.includes('remitero.vercel.app');
      const isDevelopmentByUrl = vercelUrl.includes('remitero-dev.vercel.app');
      
      const isProduction = isVercelProduction || isProductionByHost || isProductionByUrl;
      const isDevelopment = isDevelopmentByHost || isDevelopmentByUrl;
      
      if (process.env.DATABASE_SCHEMA) {
        const explicitSchema = process.env.DATABASE_SCHEMA.trim().toLowerCase();
        if (isProduction) {
          return 'public'; // Forzar public en producción
        }
        if (explicitSchema === 'public' && isDevelopment) {
          return 'dev'; // Rechazar public en desarrollo
        }
        return explicitSchema;
      }
      
      if (isProduction) {
        return 'public';
      }
      
      return 'dev';
    }

    const databaseSchema = getDatabaseSchema(host);
    const vercelUrl = process.env.VERCEL_URL || '';
    const vercelEnv = process.env.VERCEL_ENV;
    const databaseSchemaEnv = process.env.DATABASE_SCHEMA;
    const isProductionByHost = host.includes('v0-remitero') || host.includes('remitero.vercel.app');
    const isDevelopmentByHost = host.includes('remitero-dev');
    const isProductionByUrl = vercelUrl.includes('v0-remitero') || vercelUrl.includes('remitero.vercel.app');
    const isDevelopmentByUrl = vercelUrl.includes('remitero-dev');

    return NextResponse.json({
      schema: databaseSchema,
      environment: {
        vercelEnv: vercelEnv || 'not-set',
        vercelUrl: vercelUrl || 'not-set',
        host: host || 'not-set',
        fullUrl: fullUrl || 'not-set',
        databaseSchemaEnv: databaseSchemaEnv || 'not-set',
        nodeEnv: process.env.NODE_ENV || 'not-set',
      },
      detection: {
        isProductionByEnv: process.env.VERCEL_ENV === 'production',
        isProductionByHost: isProductionByHost,
        isProductionByUrl: isProductionByUrl,
        isDevelopmentByHost: isDevelopmentByHost,
        isDevelopmentByUrl: isDevelopmentByUrl,
        isPreview: process.env.VERCEL_ENV === 'preview',
        isDevelopment: process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV,
        usingExplicitSchema: !!process.env.DATABASE_SCHEMA,
        finalDecision: isProductionByHost ? 'production-by-host' :
                      isProductionByUrl ? 'production-by-url' :
                      (process.env.VERCEL_ENV === 'production' ? 'production-by-env' : 
                      (isDevelopmentByHost ? 'development-by-host' : 'development-default')),
      },
      message: `Este entorno está usando el schema: ${databaseSchema}`,
      warning: databaseSchema === 'public' 
        ? '⚠️ Estás usando el schema PUBLIC (producción). Cualquier cambio afectará datos de producción.'
        : '✅ Estás usando el schema DEV (desarrollo). Los cambios no afectarán producción.',
      recommendation: (isProductionByHost || isProductionByUrl) && databaseSchema !== 'public'
        ? '⚠️ RECOMENDACIÓN: Configura DATABASE_SCHEMA=public en Vercel para este entorno (producción)'
        : ((isDevelopmentByHost || isDevelopmentByUrl) && databaseSchema === 'public'
          ? '❌ ERROR: Estás usando schema PUBLIC en desarrollo. Esto es peligroso!'
          : null),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error al obtener información del schema',
      message: error?.message || 'Error desconocido'
    }, { status: 500 });
  }
}


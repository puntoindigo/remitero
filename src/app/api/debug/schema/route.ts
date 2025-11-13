import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de debug para verificar qué schema está usando la aplicación
 * Útil para verificar que dev y prod están usando schemas diferentes
 */
export async function GET(request: NextRequest) {
  try {
    // Determinar schema según la misma lógica que supabase.ts
    function getDatabaseSchema(): string {
      const isVercelProduction = process.env.VERCEL_ENV === 'production';
      const vercelUrl = process.env.VERCEL_URL || '';
      const isProductionUrl = vercelUrl.includes('v0-remitero.vercel.app') || 
                              vercelUrl.includes('remitero.vercel.app');
      const isDevelopmentUrl = vercelUrl.includes('remitero-dev.vercel.app');
      
      if (process.env.DATABASE_SCHEMA) {
        const explicitSchema = process.env.DATABASE_SCHEMA.trim().toLowerCase();
        if (isVercelProduction || isProductionUrl) {
          return 'public'; // Forzar public en producción
        }
        if (explicitSchema === 'public' && (isDevelopmentUrl || !isVercelProduction)) {
          return 'dev'; // Rechazar public en desarrollo
        }
        return explicitSchema;
      }
      
      if (isVercelProduction || isProductionUrl) {
        return 'public';
      }
      
      return 'dev';
    }

    const databaseSchema = getDatabaseSchema();
    const vercelUrl = process.env.VERCEL_URL || '';
    const vercelEnv = process.env.VERCEL_ENV;
    const databaseSchemaEnv = process.env.DATABASE_SCHEMA;
    const isProductionUrl = vercelUrl.includes('v0-remitero') || vercelUrl.includes('remitero.vercel.app');
    const isDevelopmentUrl = vercelUrl.includes('remitero-dev');

    return NextResponse.json({
      schema: databaseSchema,
      environment: {
        vercelEnv: vercelEnv || 'not-set',
        vercelUrl: vercelUrl || 'not-set',
        databaseSchemaEnv: databaseSchemaEnv || 'not-set',
        nodeEnv: process.env.NODE_ENV || 'not-set',
      },
      detection: {
        isProductionByEnv: process.env.VERCEL_ENV === 'production',
        isProductionByUrl: isProductionUrl,
        isDevelopmentByUrl: isDevelopmentUrl,
        isPreview: process.env.VERCEL_ENV === 'preview',
        isDevelopment: process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV,
        usingExplicitSchema: !!process.env.DATABASE_SCHEMA,
        finalDecision: isProductionUrl ? 'production-by-url' : 
                      (process.env.VERCEL_ENV === 'production' ? 'production-by-env' : 'development'),
      },
      message: `Este entorno está usando el schema: ${databaseSchema}`,
      warning: databaseSchema === 'public' 
        ? '⚠️ Estás usando el schema PUBLIC (producción). Cualquier cambio afectará datos de producción.'
        : '✅ Estás usando el schema DEV (desarrollo). Los cambios no afectarán producción.',
      recommendation: isProductionUrl && databaseSchema !== 'public'
        ? '⚠️ RECOMENDACIÓN: Configura DATABASE_SCHEMA=public en Vercel para este entorno (producción)'
        : (!isProductionUrl && databaseSchema === 'public'
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


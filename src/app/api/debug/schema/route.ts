import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint de debug para verificar qué schema está usando la aplicación
 * Útil para verificar que dev y prod están usando schemas diferentes
 */
export async function GET(request: NextRequest) {
  try {
    // Determinar schema según la misma lógica que supabase.ts
    function getDatabaseSchema(): string {
      // En producción de Vercel, usar siempre 'public'
      if (process.env.VERCEL_ENV === 'production') {
        return 'public';
      }
      
      // En desarrollo/preview, usar 'dev' o el valor de DATABASE_SCHEMA
      return process.env.DATABASE_SCHEMA || 'dev';
    }

    const databaseSchema = getDatabaseSchema();
    const vercelUrl = process.env.VERCEL_URL;
    const vercelEnv = process.env.VERCEL_ENV;
    const databaseSchemaEnv = process.env.DATABASE_SCHEMA;

    return NextResponse.json({
      schema: databaseSchema,
      environment: {
        vercelEnv: vercelEnv || 'not-set',
        vercelUrl: vercelUrl || 'not-set',
        databaseSchemaEnv: databaseSchemaEnv || 'not-set',
        nodeEnv: process.env.NODE_ENV || 'not-set',
      },
      detection: {
        isProduction: process.env.VERCEL_ENV === 'production',
        isPreview: process.env.VERCEL_ENV === 'preview',
        isDevelopment: process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV,
        usingExplicitSchema: !!process.env.DATABASE_SCHEMA,
      },
      message: `Este entorno está usando el schema: ${databaseSchema}`,
      warning: databaseSchema === 'public' 
        ? '⚠️ Estás usando el schema PUBLIC (producción). Cualquier cambio afectará datos de producción.'
        : '✅ Estás usando el schema DEV (desarrollo). Los cambios no afectarán producción.',
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error al obtener información del schema',
      message: error?.message || 'Error desconocido'
    }, { status: 500 });
  }
}


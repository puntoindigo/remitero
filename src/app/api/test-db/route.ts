import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Probando conexión a base de datos...');
    
    // Crear instancia directa de Prisma
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL
        }
      }
    });
    
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión establecida');
    
    // Probar query simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query ejecutada:', result);
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: "Conexión a base de datos exitosa",
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error en test-db:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido',
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurada' : '❌ No encontrada',
        PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? '✅ Configurada' : '❌ No encontrada',
        POSTGRES_URL: process.env.POSTGRES_URL ? '✅ Configurada' : '❌ No encontrada',
        VERCEL_ENV: process.env.VERCEL_ENV || 'No configurado'
      }
    }, { status: 500 });
  }
}

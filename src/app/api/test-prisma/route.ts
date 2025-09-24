import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Test Prisma endpoint called');
    
    // Verificar variables de entorno
    const databaseUrl = process.env.DATABASE_URL;
    const vercelEnv = process.env.VERCEL_ENV;
    
    console.log('🔧 Environment variables:');
    console.log('- VERCEL_ENV:', vercelEnv);
    console.log('- DATABASE_URL configured:', !!databaseUrl);
    console.log('- DATABASE_URL preview:', databaseUrl?.substring(0, 50) + '...');
    
    // Intentar importar Prisma
    const { PrismaClient } = await import('@prisma/client');
    console.log('✅ PrismaClient imported successfully');
    
    // Crear cliente Prisma
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
    console.log('✅ PrismaClient created successfully');
    
    // Intentar conectar
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Intentar consulta simple
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
    
    return NextResponse.json({
      success: true,
      environment: vercelEnv,
      databaseUrl: !!databaseUrl,
      userCount
    });
    
  } catch (error) {
    console.error('❌ Test Prisma error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexión
    const userCount = await prisma.user.count();
    
    // Buscar usuarios específicos
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@remitero.com', 'admin@empresademo.com']
        }
      },
      select: {
        email: true,
        role: true,
        name: true
      }
    });
    
    return NextResponse.json({
      success: true,
      environment: process.env.VERCEL_ENV || 'local',
      userCount,
      users,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL_ENV || 'local'
    }, { status: 500 });
  }
}

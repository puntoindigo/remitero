import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth endpoint called');
    
    // Verificar conexión a base de datos
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Buscar usuarios específicos
    const targetUsers = ['admin@remitero.com', 'admin@empresademo.com'];
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: targetUsers
        }
      },
      select: {
        email: true,
        role: true,
        name: true,
        password: true
      }
    });
    
    console.log(`👥 Found ${users.length} target users`);
    
    // Probar contraseña
    const testEmail = 'admin@remitero.com';
    const testPassword = 'daedae123';
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    let passwordValid = false;
    if (user) {
      passwordValid = await bcrypt.compare(testPassword, user.password);
    }
    
    return NextResponse.json({
      success: true,
      environment: process.env.VERCEL_ENV || 'local',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured',
      userCount,
      targetUsers: users.map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
        hasPassword: !!u.password
      })),
      testAuth: {
        email: testEmail,
        userFound: !!user,
        passwordValid
      }
    });
    
  } catch (error) {
    console.error('❌ Debug Auth error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL_ENV || 'local',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    }, { status: 500 });
  }
}

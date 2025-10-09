import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Google Auth - Verificando configuración...');
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    console.log('🔍 Variables de entorno:', {
      hasGoogleClientId: !!googleClientId,
      hasGoogleClientSecret: !!googleClientSecret,
      nextAuthUrl: nextAuthUrl,
      googleClientIdLength: googleClientId?.length || 0,
      googleClientSecretLength: googleClientSecret?.length || 0
    });
    
    return NextResponse.json({
      success: true,
      config: {
        hasGoogleClientId: !!googleClientId,
        hasGoogleClientSecret: !!googleClientSecret,
        nextAuthUrl: nextAuthUrl,
        googleClientIdPrefix: googleClientId?.substring(0, 20) + '...',
        googleClientSecretPrefix: googleClientSecret?.substring(0, 10) + '...',
        callbackUrl: `${nextAuthUrl}/api/auth/callback/google`
      },
      message: 'Configuración de Google OAuth verificada'
    });

  } catch (error) {
    console.error('❌ Error en debug Google Auth:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al verificar configuración de Google OAuth',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

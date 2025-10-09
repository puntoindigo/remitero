import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Google URLs - Verificando URLs de OAuth...');
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const baseUrl = request.nextUrl.origin;
    
    // URLs que deberían estar en Google Console
    const expectedUrls = {
      authorizedJavaScriptOrigins: [
        'https://remitero-dev.vercel.app',
        'https://v0-remitero.vercel.app'
      ],
      authorizedRedirectUris: [
        'https://remitero-dev.vercel.app/api/auth/callback/google',
        'https://v0-remitero.vercel.app/api/auth/callback/google'
      ]
    };
    
    // URL actual de callback
    const currentCallbackUrl = `${nextAuthUrl}/api/auth/callback/google`;
    
    // URL de Google OAuth que se está usando
    const googleOAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(currentCallbackUrl)}&response_type=code&scope=email+profile+openid&access_type=offline&prompt=consent`;
    
    console.log('🔍 URLs generadas:', {
      currentCallbackUrl,
      googleOAuthUrl: googleOAuthUrl.substring(0, 100) + '...',
      baseUrl,
      nextAuthUrl
    });
    
    return NextResponse.json({
      success: true,
      current: {
        callbackUrl: currentCallbackUrl,
        nextAuthUrl: nextAuthUrl,
        baseUrl: baseUrl,
        googleClientId: googleClientId?.substring(0, 20) + '...'
      },
      expected: expectedUrls,
      googleOAuthUrl: googleOAuthUrl,
      instructions: {
        step1: "Ve a Google Cloud Console > APIs & Services > Credentials",
        step2: "Busca tu OAuth 2.0 Client ID",
        step3: "En 'Authorized JavaScript origins' agrega: " + expectedUrls.authorizedJavaScriptOrigins.join(', '),
        step4: "En 'Authorized redirect URIs' agrega: " + expectedUrls.authorizedRedirectUris.join(', '),
        step5: "Guarda los cambios y espera 5-10 minutos"
      }
    });

  } catch (error) {
    console.error('❌ Error en debug Google URLs:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al verificar URLs de Google OAuth',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

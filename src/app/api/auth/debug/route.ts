import { NextResponse } from "next/server";

export async function GET() {
  // Endpoint de debug para verificar configuración OAuth
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim(); // Remover espacios y newlines
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  
  const config = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!googleClientId,
    hasGoogleClientSecret: !!googleClientSecret,
    nextAuthUrl: nextAuthUrl,
    nextAuthUrlLength: nextAuthUrl?.length,
    nextAuthUrlHasNewline: nextAuthUrl?.includes('\n'),
    googleClientId: googleClientId ? 
      googleClientId.substring(0, 20) + '...' : 
      'NO CONFIGURADO',
    googleClientIdLength: googleClientId?.length,
    googleClientSecretLength: googleClientSecret?.length,
    nodeEnv: process.env.NODE_ENV,
    expectedCallbackUrl: nextAuthUrl 
      ? `${nextAuthUrl}/api/auth/callback/google`
      : 'NO CONFIGURADO',
    // Listar todas las variables de entorno que empiezan con GOOGLE o NEXTAUTH
    envVars: {
      NEXTAUTH_URL: nextAuthUrl,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***CONFIGURADO***' : 'NO CONFIGURADO',
      GOOGLE_CLIENT_ID: googleClientId ? '***CONFIGURADO***' : 'NO CONFIGURADO',
      GOOGLE_CLIENT_SECRET: googleClientSecret ? '***CONFIGURADO***' : 'NO CONFIGURADO',
    }
  };

  return NextResponse.json(config, { status: 200 });
}


import { NextResponse } from "next/server";

export async function GET() {
  // Endpoint de debug para verificar configuración OAuth
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim(); // Remover espacios y newlines
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  
  // Obtener URL real que se está usando (similar a getNextAuthUrl)
  let actualNextAuthUrl = nextAuthUrl;
  if (!actualNextAuthUrl && process.env.VERCEL_URL) {
    actualNextAuthUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!actualNextAuthUrl) {
    actualNextAuthUrl = 'http://localhost:8000';
  }
  
  const config = {
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not-set',
      vercelUrl: process.env.VERCEL_URL || 'not-set',
      isVercel: !!process.env.VERCEL,
    },
    nextAuth: {
      nextAuthUrl: nextAuthUrl,
      actualNextAuthUrl: actualNextAuthUrl,
      nextAuthUrlLength: nextAuthUrl?.length,
      nextAuthUrlHasNewline: nextAuthUrl?.includes('\n'),
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      expectedCallbackUrl: `${actualNextAuthUrl}/api/auth/callback/google`,
    },
    googleOAuth: {
      hasGoogleClientId: !!googleClientId,
      hasGoogleClientSecret: !!googleClientSecret,
      googleClientId: googleClientId || 'NO CONFIGURADO',
      googleClientIdLength: googleClientId?.length,
      googleClientIdPrefix: googleClientId ? googleClientId.substring(0, 30) + '...' : 'N/A',
      googleClientIdSuffix: googleClientId ? '...' + googleClientId.substring(googleClientId.length - 10) : 'N/A',
      googleClientSecretLength: googleClientSecret?.length,
      googleClientSecretPrefix: googleClientSecret ? googleClientSecret.substring(0, 10) + '...' : 'N/A',
    },
    // Comparación: mostrar si las credenciales están configuradas
    status: {
      allConfigured: !!(nextAuthUrl && googleClientId && googleClientSecret && process.env.NEXTAUTH_SECRET),
      missingVars: [
        !nextAuthUrl && 'NEXTAUTH_URL',
        !googleClientId && 'GOOGLE_CLIENT_ID',
        !googleClientSecret && 'GOOGLE_CLIENT_SECRET',
        !process.env.NEXTAUTH_SECRET && 'NEXTAUTH_SECRET',
      ].filter(Boolean) as string[],
    }
  };

  return NextResponse.json(config, { status: 200 });
}


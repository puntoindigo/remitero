import { NextResponse } from "next/server";

export async function GET() {
  // Endpoint de debug para verificar configuración OAuth
  const config = {
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 
      process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 
      'NO CONFIGURADO',
    nodeEnv: process.env.NODE_ENV,
    expectedCallbackUrl: process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : 'NO CONFIGURADO'
  };

  return NextResponse.json(config, { status: 200 });
}


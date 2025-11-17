import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const handler = NextAuth(authOptions)

// Agregar logging para debugging
const wrappedHandler = async (req: any, context: any) => {
  try {
    // Manejar diferentes formatos de URL que puede recibir NextAuth
    let url: string = '';
    let pathname: string = '';
    let searchParams: string = '';
    
    try {
      // Intentar obtener URL de diferentes fuentes
      if (req?.url) {
        url = typeof req.url === 'string' ? req.url : req.url.toString();
      } else if (context?.params) {
        // Si viene de un catch-all route, construir la URL desde los params
        const params = context.params;
        if (typeof params === 'string') {
          url = params;
        } else if (Array.isArray(params)) {
          url = '/' + params.join('/');
        } else {
          url = '';
        }
      } else if (req?.headers?.referer) {
        url = req.headers.referer;
      } else {
        url = '';
      }
      
      // Solo intentar construir URL si tenemos un string válido
      if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'))) {
        try {
          const urlObj = url.startsWith('http') 
            ? new URL(url) 
            : new URL(url, `http://localhost`); // Base URL temporal para URLs relativas
          pathname = urlObj.pathname;
          searchParams = urlObj.searchParams.toString();
        } catch (urlError) {
          // Si falla, intentar extraer pathname manualmente
          const match = url.match(/^[^?]*/);
          pathname = match ? match[0] : '';
          const searchMatch = url.match(/\?([^#]*)/);
          searchParams = searchMatch ? searchMatch[1] : '';
        }
      } else {
        // Si no tenemos URL válida, usar valores por defecto
        pathname = '';
        searchParams = '';
      }
    } catch (urlParseError) {
      // Si todo falla, usar valores por defecto
      console.warn('⚠️ [NextAuth API] No se pudo parsear URL:', urlParseError);
      pathname = '';
      searchParams = '';
    }
    
    // Log detallado del request
    const isCallback = pathname.includes('/callback');
    const isSignin = pathname.includes('/signin');
    
    if (isCallback) {
      console.log('🔄 [NextAuth Callback] Iniciando callback de Google OAuth', {
        url: url,
        pathname: pathname,
        hasCode: url.includes('code='),
        hasError: url.includes('error='),
        schema: process.env.DATABASE_SCHEMA || 'default'
      });
    }
    
    console.log('🌐 [NextAuth API] Request recibido', {
      method: req.method,
      url: url.toString(),
      pathname,
      searchParams,
      isCallback,
      isSignin,
      provider: searchParams.includes('provider=') ? new URLSearchParams(searchParams).get('provider') : null,
      error: searchParams.includes('error=') ? new URLSearchParams(searchParams).get('error') : null,
      code: searchParams.includes('code=') ? 'PRESENTE' : 'NO PRESENTE',
      state: searchParams.includes('state=') ? 'PRESENTE' : 'NO PRESENTE'
    });
    
    const result = await handler(req, context);
    
    // Verificar si la respuesta contiene un error de OAuth
    if (result?.status && result.status >= 400) {
      const location = result?.headers?.get('location');
      if (location && location.includes('error=')) {
        const errorParam = new URL(location).searchParams.get('error');
        console.error('❌ [NextAuth API] Error detectado en respuesta:', {
          status: result.status,
          error: errorParam,
          location: location
        });
        
        // Si es un error de OAuth, verificar las credenciales
        if (errorParam === 'OAuthCallback' || errorParam === 'Configuration') {
          console.error('❌ [NextAuth API] Verificando credenciales de Google OAuth...');
          const hasClientId = !!process.env.GOOGLE_CLIENT_ID?.trim();
          const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET?.trim();
          const clientIdPrefix = process.env.GOOGLE_CLIENT_ID?.substring(0, 30) || 'NO CONFIGURADO';
          console.error('❌ [NextAuth API] Estado de credenciales:', {
            hasClientId,
            hasClientSecret,
            clientIdPrefix: clientIdPrefix + '...',
            clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
            clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length
          });
        }
      }
    }
    
    console.log('✅ [NextAuth API] Request procesado exitosamente', {
      status: result?.status,
      statusText: result?.statusText,
      hasLocation: result?.headers?.get('location') ? 'PRESENTE' : 'NO PRESENTE',
      location: result?.headers?.get('location')
    });
    
    return result;
  } catch (error: any) {
    console.error('❌ [NextAuth API] Error procesando request:', error);
    console.error('❌ [NextAuth API] Error message:', error?.message);
    console.error('❌ [NextAuth API] Error code:', error?.code);
    console.error('❌ [NextAuth API] Error stack:', error?.stack);
    
    // Detectar error específico de invalid_client
    if (error?.message?.includes('invalid_client') || error?.message?.includes('Unauthorized')) {
      console.error('❌ [NextAuth API] ERROR: invalid_client detectado - Las credenciales de Google OAuth son inválidas o el cliente está deshabilitado');
      console.error('❌ [NextAuth API] Verifica en Google Cloud Console:');
      console.error('   1. Que el cliente OAuth esté HABILITADO (no deshabilitado)');
      console.error('   2. Que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET sean correctos');
      console.error('   3. Que las URIs de redirección estén configuradas correctamente');
    }
    
    // En lugar de lanzar el error, devolver una respuesta JSON de error
    // Esto previene que NextAuth reciba HTML en lugar de JSON
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error?.message || 'An error occurred processing the authentication request',
        code: error?.code || 'UNKNOWN_ERROR'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }

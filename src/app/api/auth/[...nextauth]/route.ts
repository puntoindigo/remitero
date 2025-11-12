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
    
    console.log('🌐 [NextAuth API] Request recibido', {
      method: req.method,
      url: url.toString(),
      pathname,
      searchParams,
      isCallback: pathname.includes('/callback'),
      isSignin: pathname.includes('/signin'),
      provider: searchParams.includes('provider=') ? new URLSearchParams(searchParams).get('provider') : null,
      error: searchParams.includes('error=') ? new URLSearchParams(searchParams).get('error') : null,
      code: searchParams.includes('code=') ? 'PRESENTE' : 'NO PRESENTE',
      state: searchParams.includes('state=') ? 'PRESENTE' : 'NO PRESENTE'
    });
    
    const result = await handler(req, context);
    
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

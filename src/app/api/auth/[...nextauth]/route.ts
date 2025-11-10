import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Agregar logging para debugging
const wrappedHandler = async (req: any, context: any) => {
  try {
    const url = req.url || context?.params || '';
    const urlObj = typeof url === 'string' ? new URL(url) : new URL(url.toString());
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams.toString();
    
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
    throw error;
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }

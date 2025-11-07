import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

// Agregar logging para debugging
const wrappedHandler = async (req: any, context: any) => {
  const url = req.url || context?.params || '';
  console.log('🌐 [NextAuth API] Request recibido', {
    method: req.method,
    url: url.toString(),
    pathname: new URL(url).pathname,
    searchParams: new URL(url).searchParams.toString()
  });
  
  try {
    const result = await handler(req, context);
    console.log('✅ [NextAuth API] Request procesado exitosamente');
    return result;
  } catch (error: any) {
    console.error('❌ [NextAuth API] Error procesando request:', error);
    console.error('❌ [NextAuth API] Error message:', error?.message);
    console.error('❌ [NextAuth API] Error stack:', error?.stack);
    throw error;
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }

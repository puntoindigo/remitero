import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas completamente públicas - NO pasan por autenticación
  if (pathname.startsWith("/auth") || 
      pathname === "/" || 
      pathname.startsWith("/manual") ||
      pathname.startsWith("/api/debug")) {
    return NextResponse.next()
  }

  // Rutas de impresión - permitir acceso sin sesión (públicas para impresión)
  if (pathname.match(/\/remitos\/[^\/]+\/print/)) {
    console.log('🖨️ [MIDDLEWARE] Print route detected - allowing public access:', pathname);
    return NextResponse.next()
  }

  // Para rutas protegidas, verificar autenticación
  const token = await getToken({ req })

  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/remitos") || 
      pathname.startsWith("/productos") || 
      pathname.startsWith("/clientes") || 
      pathname.startsWith("/categorias") ||
      pathname.startsWith("/usuarios") ||
      pathname.startsWith("/empresas")) {
    
    if (!token) {
      // Asegurar que el redirect use el puerto correcto (de NEXTAUTH_URL si está configurado)
      const loginUrl = new URL("/auth/login", req.url);
      
      // En desarrollo, verificar y corregir el puerto si es necesario
      if (process.env.NODE_ENV === "development" && process.env.NEXTAUTH_URL) {
        try {
          const nextAuthUrlObj = new URL(process.env.NEXTAUTH_URL);
          const reqUrlObj = new URL(req.url);
          
          // Si son localhost y los puertos difieren, usar el puerto de NEXTAUTH_URL
          if (reqUrlObj.hostname === "localhost" && 
              nextAuthUrlObj.hostname === "localhost" &&
              reqUrlObj.port !== nextAuthUrlObj.port) {
            loginUrl.port = nextAuthUrlObj.port;
          }
        } catch {
          // Si hay error, usar la URL original
        }
      }
      
      return NextResponse.redirect(loginUrl);
    }

    // Verificar roles para rutas específicas
    if (pathname.startsWith("/usuarios") && 
        token.role !== "SUPERADMIN" && 
        token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (pathname.startsWith("/empresas") && token.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/remitos/:path*",
    "/productos/:path*",
    "/clientes/:path*",
    "/categorias/:path*",
    "/usuarios/:path*",
    "/empresas/:path*"
  ]
}

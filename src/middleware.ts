import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas completamente públicas - NO pasan por autenticación
  if (pathname.startsWith("/auth") || 
      pathname === "/" || 
      pathname.startsWith("/manual")) {
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
      return NextResponse.redirect(new URL("/auth/login", req.url))
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

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Rutas que requieren autenticación
    if (pathname.startsWith("/dashboard") || 
        pathname.startsWith("/remitos") || 
        pathname.startsWith("/productos") || 
        pathname.startsWith("/clientes") || 
        pathname.startsWith("/categorias") ||
        pathname.startsWith("/usuarios")) {
      
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
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Rutas públicas
        if (pathname.startsWith("/auth") || 
            pathname === "/" || 
            pathname.startsWith("/manual")) {
          return true
        }

        // Rutas protegidas requieren token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/remitos/:path*",
    "/productos/:path*",
    "/clientes/:path*",
    "/categorias/:path*",
    "/usuarios/:path*",
    "/empresas/:path*",
    "/manual/:path*"
  ]
}

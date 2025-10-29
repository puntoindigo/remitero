"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import { MobileMenu } from "./MobileMenu";
import { FloatingActionButton } from "./FloatingActionButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error", "/manual"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === "/";

  // Si es una ruta pública, renderizar sin autenticación
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Redirección simple sin useEffect - ya corregido
  if (status === "unauthenticated") {
    // Usar window.location para evitar problemas con React
    if (typeof window !== 'undefined') {
      window.location.href = "/auth/login";
    }
    return null;
  }

  // Mostrar loading mientras verifica sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verificando sesión..." />
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada
  if (!session) {
    return null;
  }

  // Detectar página actual y configurar FAB
  const getFABConfig = () => {
    const fabRoutes: Record<string, { label: string; action: string }> = {
      '/remitos': { label: 'Nuevo Remito', action: 'newRemito' },
      '/clientes': { label: 'Nuevo Cliente', action: 'newCliente' },
      '/productos': { label: 'Nuevo Producto', action: 'newProducto' },
      '/categorias': { label: 'Nueva Categoría', action: 'newCategoria' },
      '/estados-remitos': { label: 'Nuevo Estado', action: 'newEstado' },
      '/usuarios': { label: 'Nuevo Usuario', action: 'newUsuario' },
      '/empresas': { label: 'Nueva Empresa', action: 'newEmpresa' },
    };

    return fabRoutes[pathname] || null;
  };

  const fabConfig = getFABConfig();

  const handleFABClick = () => {
    // Emitir evento personalizado para que cada página lo maneje
    const event = new CustomEvent('fabClick', { detail: { action: fabConfig?.action } });
    window.dispatchEvent(event);
  };

  // Para rutas protegidas con sesión válida
  return (
    <>
      {/* Desktop Navigation */}
      <div className="desktop-only">
        <TopBar />
        <Header />
      </div>
      
      {/* Mobile Navigation */}
      <div className="mobile-only">
        <MobileMenu />
        {fabConfig && (
          <FloatingActionButton
            onClick={handleFABClick}
            label={fabConfig.label}
          />
        )}
      </div>
      
      <div className="container" style={{
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        {children}
      </div>

      <style jsx global>{`
        .desktop-only {
          display: block;
        }
        .mobile-only {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: block;
          }
          
          .container {
            padding-left: 12px !important;
            padding-right: 12px !important;
            padding-top: 70px !important;
          }
        }
      `}</style>
    </>
  );
}

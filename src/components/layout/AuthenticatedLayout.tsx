"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import { MobileMenu } from "./MobileMenu";
import { FloatingActionButton } from "./FloatingActionButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";
import { NetworkErrorBanner } from "@/components/common/NetworkErrorBanner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { OSDBottomNavigation } from "./OSDBottomNavigation";
import { GlobalLoadingOverlay } from "@/components/common/GlobalLoadingOverlay";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { useApiWarmup } from "@/hooks/useApiWarmup";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { isLoading: isNavigating, message: navigationMessage } = useNavigationLoading();
  
  // OPTIMIZACIÓN: Prefetch rutas críticas y warm-up de APIs después del login
  useRoutePrefetch();
  useApiWarmup();
  
  // Detectar si el usuario tiene contraseña temporal (DEBE estar antes de cualquier return)
  useEffect(() => {
    if (session?.user && (session.user as any).hasTemporaryPassword) {
      setShowChangePassword(true);
    }
  }, [session]);

  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error", "/manual"];
  const isPrintRoute = pathname.match(/\/remitos\/[^\/]+\/print/);
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === "/" || isPrintRoute;

  // Si es una ruta pública (incluida impresión), renderizar sin autenticación
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

  // Mostrar loading mientras verifica sesión (no para rutas de impresión)
  if (status === "loading" && !isPrintRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verificando sesión..." />
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada (excepto para impresión)
  if (!session && !isPrintRoute) {
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

  const handleChangePassword = async (newPassword: string) => {
    if (!session?.user?.id) return;

    setIsChangingPassword(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
          // También actualizar el flag de contraseña temporal
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Error al cambiar la contraseña');
      }

      // Actualizar el flag has_temporary_password en la BD
      const updateFlagResponse = await fetch(`/api/users/${session.user.id}/clear-temporary-password`, {
        method: 'POST',
      });

      if (!updateFlagResponse.ok) {
        console.error('Error al actualizar flag de contraseña temporal');
      }

      setShowChangePassword(false);
      // Recargar la sesión para actualizar el token
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Error al cambiar la contraseña');
      throw error;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Para rutas protegidas con sesión válida
  return (
    <>
      {/* Overlay de loading global para navegaciones */}
      {/* OPTIMIZADO: Solo mostrar si realmente está cargando (no solo verificando sesión rápida) */}
      <GlobalLoadingOverlay 
        isLoading={isNavigating && pathname !== '/dashboard'} 
        message={navigationMessage}
      />

      <NetworkErrorBanner isOnline={isOnline} />
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
        paddingBottom: '120px', // Espacio para la navegación OSD
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

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => {}} // No permitir cerrar sin cambiar la contraseña
        onSubmit={handleChangePassword}
        isSubmitting={isChangingPassword}
      />

      {/* Navegación OSD tipo monitor */}
      <OSDBottomNavigation />
    </>
  );
}

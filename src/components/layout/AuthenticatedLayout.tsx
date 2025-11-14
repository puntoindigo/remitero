"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import { VercelMobileNav } from "./VercelMobileNav";
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
  
  // IMPORTANTE: Todos los hooks deben llamarse ANTES de cualquier return condicional
  // Los hooks internos manejarán la lógica condicional
  useRoutePrefetch();
  useApiWarmup();
  
  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error", "/manual", "/web"];
  const isPrintRoute = pathname.match(/\/remitos\/[^\/]+\/print/);
  // No incluir "/" como ruta pública - page.tsx manejará la redirección
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || isPrintRoute;
  
  // Detectar si hay error en la URL (para no hacer precaches)
  // Hacerlo síncrono para evitar problemas con hooks
  const hasAuthError = typeof window !== 'undefined' && (
    window.location.href.includes('error=OAuthCallback') || 
    window.location.href.includes('error=OAuthSignin') || 
    window.location.href.includes('error=AccessDenied') ||
    window.location.href.includes('error=UserInactive')
  );
  
  // Detectar si el usuario tiene contraseña temporal (DEBE estar antes de cualquier return)
  useEffect(() => {
    // Solo mostrar el modal si hay sesión, tiene contraseña temporal, y no estamos cambiando la contraseña
    if (session?.user && (session.user as any).hasTemporaryPassword && !isChangingPassword) {
      setShowChangePassword(true);
    } else if (!(session?.user && (session.user as any).hasTemporaryPassword)) {
      // Si no tiene contraseña temporal, cerrar el modal
      setShowChangePassword(false);
    }
  }, [session, isChangingPassword]);

  // Validar que la sesión corresponde a un usuario válido en la BD
  // Esto previene sesiones "fantasma" cuando el schema está vacío
  // NO validar si estamos en una ruta pública (incluida login)
  const [isValidatingSession, setIsValidatingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    // NO validar si estamos en una ruta pública (login, error, etc.)
    // Esto evita loops infinitos cuando redirigimos a login
    if (isPublicRoute || hasAuthError) {
      setIsValidatingSession(false);
      setSessionValid(null);
      return;
    }

    // Solo validar si hay sesión
    if (!session?.user?.id) {
      setIsValidatingSession(false);
      setSessionValid(null);
      return;
    }

    // Validar sesión contra la BD
    const validateSession = async () => {
      try {
        const response = await fetch('/api/auth/verify-session', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          console.warn('⚠️ [AuthenticatedLayout] Error verificando sesión:', response.status);
          setSessionValid(false);
          setIsValidatingSession(false);
          // Cerrar sesión y redirigir
          await handleInvalidSession();
          return;
        }

        const result = await response.json();
        
        if (!result.valid) {
          console.warn('⚠️ [AuthenticatedLayout] Sesión inválida:', result.reason);
          setSessionValid(false);
          setIsValidatingSession(false);
          // Cerrar sesión y redirigir
          await handleInvalidSession();
          return;
        }

        // Sesión válida
        setSessionValid(true);
        setIsValidatingSession(false);
      } catch (error) {
        console.error('❌ [AuthenticatedLayout] Error validando sesión:', error);
        // En caso de error, asumir que la sesión es inválida por seguridad
        setSessionValid(false);
        setIsValidatingSession(false);
        await handleInvalidSession();
      }
    };

    // Función helper para manejar sesión inválida
    const handleInvalidSession = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Limpiar localStorage primero
        localStorage.removeItem('impersonation');
        
        // Intentar cerrar sesión de NextAuth (puede fallar si la sesión ya no es válida)
        try {
          await signOut({ redirect: false });
        } catch (signOutError) {
          // Ignorar errores al cerrar sesión - puede fallar si la sesión ya no es válida
          console.warn('⚠️ [AuthenticatedLayout] Error al cerrar sesión (esperado):', signOutError);
        }
      } catch (error) {
        console.warn('⚠️ [AuthenticatedLayout] Error en handleInvalidSession:', error);
      } finally {
        // Redirigir a login con mensaje de error
        window.location.href = '/auth/login?error=SessionInvalid';
      }
    };

    validateSession();
  }, [session?.user?.id, isPublicRoute, hasAuthError]);
  
  // Si es una ruta pública (incluida impresión), renderizar sin autenticación
  // Esto debe ir DESPUÉS de todos los hooks
  if (isPublicRoute || hasAuthError) {
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

  // Validar que la sesión corresponde a un usuario válido en la BD
  // Esto previene sesiones "fantasma" cuando el schema está vacío
  if (session?.user?.id && isValidatingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Validando credenciales..." />
      </div>
    );
  }

  // Si la sesión no es válida, no renderizar nada (ya se redirigió a login)
  if (session?.user?.id && sessionValid === false) {
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

      // El endpoint PUT /api/users/[id] ya limpia has_temporary_password automáticamente
      // La actividad se registra automáticamente en el endpoint PUT /api/users/[id]

      // Forzar actualización de la sesión de NextAuth antes de recargar
      // Esto asegura que hasTemporaryPassword se actualice en el token
      const { update } = await import('next-auth/react');
      await update();
      
      // Cerrar el modal después de actualizar la sesión
      setShowChangePassword(false);
      
      // Esperar un momento para que la sesión se actualice antes de recargar
      setTimeout(() => {
        // Recargar la página para aplicar los cambios
      window.location.reload();
      }, 500);
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
      
      {/* Mobile Navigation - Estilo Vercel */}
      <div className="mobile-only">
        <VercelMobileNav />
        {fabConfig && (
          <FloatingActionButton
            onClick={handleFABClick}
            label={fabConfig.label}
          />
        )}
      </div>
      
      <div className="container" style={{
        paddingTop: '0',
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
          /* Prevenir overflow horizontal */
          * {
            max-width: 100vw;
            box-sizing: border-box;
          }
          
          html, body {
            overflow-x: hidden;
            width: 100%;
            position: relative;
          }
          
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: block;
          }
          
          /* Container líquido - sin overflow */
          .container {
            width: 100vw !important;
            max-width: 100vw !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-top: 56px !important; /* Espacio para header mobile */
            padding-bottom: 100px !important; /* Espacio para bottom nav mobile */
            margin: 0 !important;
            overflow-x: hidden !important;
          }
          
          /* Main content líquido */
          main.main-content {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow-x: hidden !important;
          }
          
          /* Form section - selector empresa pegado al top */
          .form-section {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          
          /* Selector de empresa - pegado al top sin padding */
          .form-section > div:first-child {
            padding: 12px 16px 0 16px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Contenido con padding lateral */
          .form-section > *:not(:first-child) {
            padding-left: 16px !important;
            padding-right: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Tablas - diseño líquido sin overflow */
          .data-table-container,
          .data-table-wrapper {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          
          .data-table {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 12px;
            border-collapse: collapse;
            table-layout: fixed; /* Layout fijo para mejor control */
          }
          
          .data-table th {
            padding: 10px 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #f8f9fa;
            position: sticky;
            top: 56px;
            z-index: 10;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* Ocultar header cuando showActions es false */
          .data-table thead[style*="display: none"] {
            display: none !important;
          }
          
          /* Ajustar padding de tbody cuando no hay header */
          .data-table:has(thead[style*="display: none"]) tbody tr:first-child td {
            padding-top: 0.5rem;
          }
          
          .data-table td {
            padding: 8px 6px;
            font-size: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
            max-width: 0; /* Permite que las celdas se ajusten */
          }
          
          /* Evitar overflow en elementos internos */
          .data-table td > * {
            max-width: 100% !important;
            overflow: hidden;
            box-sizing: border-box;
          }
          
          /* Asegurar que los botones no se salgan */
          .data-table td button {
            max-width: 100%;
            overflow: visible;
          }
          
          /* Selectores y campos - diseño líquido */
          .filterable-select,
          .search-input,
          input,
          select,
          textarea {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px;
            box-sizing: border-box;
          }
          
          /* Grid de filtros - responsive líquido */
          .form-section > div[style*="grid"] {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            gap: 0.75rem !important;
            width: 100% !important;
            max-width: 100% !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          
          /* Espaciado optimizado */
          .form-section > * {
            margin-bottom: 0.75rem;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .form-section > *:last-child {
            margin-bottom: 0;
          }
          
          /* Botones y acciones - sin overflow */
          button,
          .action-buttons,
          .action-button {
            max-width: 100% !important;
            box-sizing: border-box;
          }
          
          /* Deshabilitar autofocus en mobile para evitar teclado */
          input:focus,
          textarea:focus,
          select:focus {
            outline: none;
          }
          
          /* Prevenir que los campos abran el teclado automáticamente */
          input[autofocus],
          textarea[autofocus],
          select[autofocus] {
            autofocus: false;
          }
        }
      `}</style>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => {}} // No permitir cerrar sin cambiar la contraseña
        onSubmit={handleChangePassword}
        isSubmitting={isChangingPassword}
        isMandatory={true}
      />

      {/* Navegación OSD tipo monitor */}
      <OSDBottomNavigation />
      
      {/* Footer con copyright */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '24px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#6b7280',
        zIndex: 100,
        padding: '0 16px'
      }}>
        <p style={{ margin: 0 }}>
          © 2025 Desarrollado por{' '}
          <a 
            href="https://www.linkedin.com/company/punto-indigo/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Punto Indigo
          </a>
        </p>
      </footer>
    </>
  );
}

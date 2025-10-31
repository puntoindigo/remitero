"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, Shield, UserCheck } from "lucide-react";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useImpersonation } from "@/hooks/useImpersonation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ShortcutText } from "@/components/common/ShortcutText";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import ColorThemeSelector from "@/components/common/ColorThemeSelector";

export default function TopBar() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { stopImpersonation, isImpersonating } = useImpersonation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { colors } = useColorTheme();
  const topbarRef = useRef<HTMLDivElement>(null);

  // Aplicar tema al topbar con color más oscuro que el header
  useEffect(() => {
    if (topbarRef.current) {
      // El color del topbar ya se aplica vía CSS variable --theme-topbar-color
      // Solo necesitamos asegurar que se actualice cuando cambia el tema
      topbarRef.current.style.transition = 'background-color 0.3s ease';
    }
  }, [colors.primary]);

  if (!session || !currentUser) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== 'undefined') {
        // Limpiar storage primero para evitar problemas
        const impersonationData = localStorage.getItem('impersonation');
        if (impersonationData) {
          localStorage.removeItem('impersonation');
        }
        
        // Detener impersonation si está activo (en background, sin esperar)
        if (isImpersonating) {
          stopImpersonation().catch(() => {
            // Ignorar errores silenciosamente
          });
        }
        
        // Hacer logout sin redirigir automáticamente y sin callbackUrl
        // Esto evita que NextAuth intente hacer fetch a /auth/login
        signOut({ 
          redirect: false
        }).catch(() => {
          // Ignorar errores silenciosamente
        });
        
        // Redirigir inmediatamente usando window.location
        // Usar un pequeño delay para asegurar que el signOut se inicie
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 50);
      }
    } catch (error) {
      // Si hay algún error, redirigir de todas formas
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const handleLogoutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
    } catch (error) {
      console.error('Error al detener impersonation:', error);
    }
  };

  const getRoleIcon = () => {
    if (currentUser.isImpersonating) {
      return <UserCheck className="h-4 w-4" />;
    }
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return <Shield className="h-4 w-4" />;
      case 'ADMIN':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleText = () => {
    if (currentUser.isImpersonating) {
      return 'IMPERSONANDO';
    }
    return currentUser.role;
  };

  return (
    <>
      <div ref={topbarRef} className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            {/* Espacio vacío para balance visual */}
          </div>
          
          <div className="topbar-right">
            <ColorThemeSelector />
            <div className="user-info-topbar">
              <div className="user-details">
                <span className="user-name">
                  <span 
                    style={{ 
                      marginRight: '0.5rem',
                      fontSize: '1.1rem',
                      filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.3)) brightness(1.2)',
                      display: 'inline-block'
                    }}
                  >
                    👤
                  </span>
                  {currentUser.isImpersonating 
                    ? (typeof window !== 'undefined' && localStorage.getItem('impersonation') 
                        ? JSON.parse(localStorage.getItem('impersonation')!).originalAdmin?.name 
                        : 'Admin')
                    : currentUser?.name
                  }
                </span>
                {currentUser.role !== 'USER' && (
                  <div className="user-role">
                    {getRoleIcon()}
                    <span>{getRoleText()}</span>
                  </div>
                )}
                {currentUser.isImpersonating && (
                  <div className="impersonation-info">
                    <span className="impersonation-text">
                      Como: {currentUser?.name}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="topbar-actions">
                {currentUser.isImpersonating ? (
                  <button 
                    onClick={handleStopImpersonation} 
                    className="topbar-button impersonation-button"
                    disabled={isImpersonating}
                    title="Volver a mi cuenta de administrador"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Volver</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleLogoutRequest} 
                    className="topbar-button logout-button"
                    title="Cerrar sesión (S)"
                  >
                    <span style={{ fontSize: '1rem' }}>🔒</span>
                    <ShortcutText text="Salir" shortcutKey="s" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      <DeleteConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        title="Confirmar Salida"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmButtonText="Aceptar"
        isLoading={isLoggingOut}
      />
    </>
  );
}

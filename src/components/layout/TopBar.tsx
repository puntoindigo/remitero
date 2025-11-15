"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, Shield, UserCheck, Settings, ChevronDown } from "lucide-react";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useImpersonation } from "@/hooks/useImpersonation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ShortcutText } from "@/components/common/ShortcutText";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import ColorThemeSelector from "@/components/common/ColorThemeSelector";
import { ConfiguracionModal } from "@/components/common/ConfiguracionModal";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/common/Toast";

export default function TopBar() {
  const { data: session, status: sessionStatus } = useSession();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const currentUser = useCurrentUserSimple();
  const { stopImpersonation, isImpersonating } = useImpersonation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { colors } = useColorTheme();
  const topbarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { toasts, showSuccess: showToastSuccess, removeToast } = useToast();
  // Obtener perfil del usuario actual usando la nueva API /api/profile
  const [profileUser, setProfileUser] = useState<any>(null);
  
  useEffect(() => {
    if (session?.user?.id && sessionStatus === 'authenticated') {
      // Usar la nueva API /api/profile que no requiere permisos especiales
      fetch('/api/profile')
        .then(res => res.ok ? res.json() : null)
        .then(data => setProfileUser(data))
        .catch(() => setProfileUser(null));
    }
  }, [session?.user?.id, sessionStatus]);

  // Aplicar tema al topbar con color más oscuro que el header
  useEffect(() => {
    if (topbarRef.current) {
      // El color del topbar ya se aplica vía CSS variable --theme-topbar-color
      // Solo necesitamos asegurar que se actualice cuando cambia el tema
      topbarRef.current.style.transition = 'background-color 0.3s ease';
    }
  }, [colors.primary]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setShowProfileModal(true);
  };

  const handleProfileSubmit = async (data: any) => {
    if (!session?.user?.id || !profileUser) return;
    
    setIsSubmittingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el perfil');
      }

      // Recargar el perfil usando la nueva API
      const userResponse = await fetch('/api/profile');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setProfileUser(userData);
      }
      
      // Mostrar toast de éxito
      showToastSuccess('Perfil actualizado correctamente');
      
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        setShowProfileModal(false);
      }, 500);
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      alert(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    setShowConfigModal(true);
  };

  // Calcular posición del dropdown usando position fixed
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showUserMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px de espacio
        right: window.innerWidth - rect.right
      });
    }
  }, [showUserMenu]);

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
        
        // Limpiar sessionStorage también
        sessionStorage.clear();
        
        // Detener impersonation si está activo (en background, sin esperar)
        if (isImpersonating) {
          stopImpersonation().catch(() => {
            // Ignorar errores silenciosamente
          });
        }
        
        // Registrar logout antes de cerrar sesión
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          // Ignorar errores silenciosamente
        }
        
        // Hacer logout sin redirigir automáticamente y sin callbackUrl
        // Esto evita que NextAuth intente hacer fetch a /auth/login
        await signOut({ 
          redirect: false,
          callbackUrl: '/auth/login'
        }).catch(() => {
          // Ignorar errores silenciosamente
        });
        
        // Limpiar todas las cookies relacionadas con NextAuth
        // Esto asegura que la sesión se cierre completamente
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.trim().split("=")[0];
          if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });
        
        // Redirigir inmediatamente usando window.location con replace para evitar que el usuario pueda volver atrás
        window.location.replace('/auth/login');
      }
    } catch (error) {
      // Si hay algún error, limpiar cookies y redirigir de todas formas
      if (typeof window !== 'undefined') {
        // Limpiar cookies de todas formas
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.trim().split("=")[0];
          if (cookieName.startsWith('next-auth') || cookieName.startsWith('__Secure-next-auth')) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          }
        });
        sessionStorage.clear();
        localStorage.removeItem('impersonation');
        window.location.replace('/auth/login');
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
              <div className="user-details" style={{ position: 'relative', zIndex: 10001 }} ref={userMenuRef}>
                {currentUser.role !== 'USER' && (
                  <div className="user-role">
                    {getRoleIcon()}
                    <span>{getRoleText()}</span>
                  </div>
                )}
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-menu-trigger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '1.1rem',
                      filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.3)) brightness(1.2)',
                      display: 'inline-block'
                    }}
                  >
                    👤
                  </span>
                  <span className="user-name">
                    {currentUser.isImpersonating 
                      ? (typeof window !== 'undefined' && localStorage.getItem('impersonation') 
                          ? JSON.parse(localStorage.getItem('impersonation')!).originalAdmin?.name 
                          : 'Admin')
                      : currentUser?.name
                    }
                  </span>
                  <ChevronDown 
                    className="h-3 w-3" 
                    style={{
                      transition: 'transform 0.2s',
                      transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
                {showUserMenu && dropdownPosition && (
                  <div 
                    className="user-menu-dropdown user-menu-dropdown-dark" 
                    style={{ 
                      position: 'fixed',
                      zIndex: 99999,
                      top: `${dropdownPosition.top}px`,
                      right: `${dropdownPosition.right}px`,
                    }}
                  >
                    <button
                      onClick={handleProfileClick}
                      className="user-menu-item user-menu-item-dark"
                    >
                      <User className="h-4 w-4" />
                      <span>Perfil de usuario</span>
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className="user-menu-item user-menu-item-dark"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </button>
                    <button
                      onClick={handleLogoutRequest}
                      className="user-menu-item user-menu-item-dark user-menu-item-logout"
                      title="Cerrar sesión (S)"
                    >
                      <span style={{ fontSize: '1rem' }}>🔒</span>
                      <span>Salir</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>(S)</span>
                    </button>
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
                {currentUser.isImpersonating && (
                  <button 
                    onClick={handleStopImpersonation} 
                    className="topbar-button impersonation-button"
                    disabled={isImpersonating}
                    title="Volver a mi cuenta de administrador"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Volver</span>
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

      <ConfiguracionModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />

      {profileUser && (
        <UsuarioForm
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSubmit={handleProfileSubmit}
          isSubmitting={isSubmittingProfile}
          isCurrentUser={true}
          editingUser={{
            id: profileUser.id,
            name: profileUser.name,
            email: profileUser.email,
            role: profileUser.role,
            phone: profileUser.phone,
            address: profileUser.address,
            companyId: profileUser.company?.id,
            enableBotonera: (profileUser as any).enable_botonera ?? false
          }}
          companies={[]}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

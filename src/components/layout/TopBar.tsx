"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { LogOut, User, Shield, UserCheck } from "lucide-react";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useImpersonation } from "@/hooks/useImpersonation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

export default function TopBar() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { stopImpersonation, isImpersonating } = useImpersonation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
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
      <div className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            {/* Espacio vacío para balance visual */}
          </div>
          
          <div className="topbar-right">
            <div className="user-info-topbar">
              <div className="user-details">
                <span className="user-name">
                  {currentUser.isImpersonating 
                    ? (typeof window !== 'undefined' && localStorage.getItem('impersonation') 
                        ? JSON.parse(localStorage.getItem('impersonation')!).originalAdmin?.name 
                        : 'Admin')
                    : currentUser.name
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
                      Como: {currentUser.name}
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
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Salir</span>
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
      />
    </>
  );
}

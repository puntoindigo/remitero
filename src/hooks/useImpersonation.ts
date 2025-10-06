import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useMessageModal } from './useMessageModal';

export const useImpersonation = () => {
  const { data: session, update } = useSession();
  const { showSuccess, showError } = useMessageModal();
  const [isImpersonating, setIsImpersonating] = useState(false);

  const startImpersonation = async (targetUserId: string) => {
    try {
      console.log('🚀 Iniciando impersonation para usuario:', targetUserId);
      console.log('🔍 Sesión actual:', session);
      setIsImpersonating(true);

      const response = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al impersonar usuario');
      }

      console.log('✅ Impersonation exitosa, guardando en localStorage...');
      
      // Guardar datos de impersonation en localStorage
      localStorage.setItem('impersonation', JSON.stringify({
        isActive: true,
        targetUser: data.session.user,
        originalAdmin: data.session.user.originalAdmin,
        startedAt: data.session.impersonation.startedAt
      }));
      
      showSuccess(data.message);
      
      // Recargar la página para aplicar los cambios
      console.log('🔄 Recargando página...');
      window.location.reload();

    } catch (error) {
      console.error('❌ Error al impersonar:', error);
      showError(error instanceof Error ? error.message : 'Error al impersonar usuario');
    } finally {
      setIsImpersonating(false);
    }
  };

  const stopImpersonation = async () => {
    try {
      console.log('🛑 Deteniendo impersonation...');
      setIsImpersonating(true);

      // Remover datos de impersonation del localStorage
      localStorage.removeItem('impersonation');
      
      showSuccess('Volviste a tu cuenta de administrador');
      
      // Recargar la página para aplicar los cambios
      console.log('🔄 Recargando página...');
      window.location.reload();

    } catch (error) {
      console.error('❌ Error al detener impersonation:', error);
      showError(error instanceof Error ? error.message : 'Error al detener impersonation');
    } finally {
      setIsImpersonating(false);
    }
  };

  // Obtener datos de impersonation del localStorage
  const getImpersonationData = () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('impersonation');
    return data ? JSON.parse(data) : null;
  };

  const impersonationData = getImpersonationData();
  const canImpersonate = session?.user?.role === 'ADMIN' && !impersonationData?.isActive;
  const isCurrentlyImpersonating = impersonationData?.isActive;

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating,
    canImpersonate,
    isCurrentlyImpersonating,
    impersonationData,
    originalAdmin: impersonationData?.originalAdmin,
    targetUser: impersonationData?.targetUser
  };
};

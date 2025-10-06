import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useMessageModal } from './useMessageModal';

export const useImpersonation = () => {
  const { data: session, update } = useSession();
  const { showSuccess, showError } = useMessageModal();
  const [isImpersonating, setIsImpersonating] = useState(false);

  const startImpersonation = async (targetUserId: string) => {
    try {
      setIsImpersonating(true);

      const response = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al impersonar usuario');
      }

      // Guardar datos de impersonation en localStorage
      const impersonationData = {
        isActive: true,
        targetUser: data.session.user,
        originalAdmin: data.session.user.originalAdmin,
        startedAt: data.session.impersonation.startedAt
      };
      localStorage.setItem('impersonation', JSON.stringify(impersonationData));
      
      showSuccess(data.message);
      
      // Redirigir al dashboard después de impersonation
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('❌ Error al impersonar:', error);
      showError(error instanceof Error ? error.message : 'Error al impersonar usuario');
    } finally {
      setIsImpersonating(false);
    }
  };

  const stopImpersonation = async () => {
    try {
      setIsImpersonating(true);

      // Llamar al endpoint para detener impersonation en el servidor
      const response = await fetch('/api/auth/stop-impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
      }

      // Remover datos de impersonation del localStorage
      localStorage.removeItem('impersonation');
      
      showSuccess('Volviste a tu cuenta de administrador');
      
      // Redirigir al dashboard después de detener impersonation
      window.location.href = '/dashboard';

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
    const parsed = data ? JSON.parse(data) : null;
    return parsed;
  };

  const impersonationData = getImpersonationData();
  const canImpersonate = ['ADMIN', 'SUPERADMIN'].includes(session?.user?.role || '') && !impersonationData?.isActive;
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

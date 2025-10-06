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
      
      // Redirigir al dashboard después de impersonation
      console.log('🔄 Redirigiendo al dashboard...');
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
      console.log('🛑 Deteniendo impersonation...');
      setIsImpersonating(true);

      // Llamar al endpoint para detener impersonation en el servidor
      const response = await fetch('/api/auth/stop-impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ Error al detener impersonation en servidor:', response.status);
      }

      // Remover datos de impersonation del localStorage
      localStorage.removeItem('impersonation');
      
      showSuccess('Volviste a tu cuenta de administrador');
      
      // Redirigir al dashboard después de detener impersonation
      console.log('🔄 Redirigiendo al dashboard...');
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
    return data ? JSON.parse(data) : null;
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

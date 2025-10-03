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

      // Actualizar la sesión con los nuevos datos
      await update(data.session);
      
      showSuccess(data.message);
      
      // Recargar la página para aplicar los cambios de sesión
      window.location.reload();

    } catch (error) {
      console.error('Error al impersonar:', error);
      showError(error instanceof Error ? error.message : 'Error al impersonar usuario');
    } finally {
      setIsImpersonating(false);
    }
  };

  const stopImpersonation = async () => {
    try {
      setIsImpersonating(true);

      const response = await fetch('/api/auth/stop-impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al detener impersonation');
      }

      // Actualizar la sesión con los datos originales
      await update(data.session);
      
      showSuccess(data.message);
      
      // Recargar la página para aplicar los cambios de sesión
      window.location.reload();

    } catch (error) {
      console.error('Error al detener impersonation:', error);
      showError(error instanceof Error ? error.message : 'Error al detener impersonation');
    } finally {
      setIsImpersonating(false);
    }
  };

  const canImpersonate = session?.user?.role === 'ADMIN' && !session?.impersonation?.isActive;
  const isCurrentlyImpersonating = session?.impersonation?.isActive;

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating,
    canImpersonate,
    isCurrentlyImpersonating,
    impersonationData: session?.impersonation,
    originalAdmin: session?.user?.originalAdmin
  };
};

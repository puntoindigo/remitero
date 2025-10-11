import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
  const { data: session } = useSession();
  const [impersonationData, setImpersonationData] = useState<any>(null);

  // Obtener datos de impersonation del localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('impersonation');
      const parsed = data ? JSON.parse(data) : null;
      setImpersonationData(parsed);
    }
  }, []);

  // Si hay impersonation activa, devolver el usuario impersonado con el ID del admin
  if (impersonationData?.isActive && impersonationData?.targetUser) {
    return {
      ...impersonationData.targetUser, // Datos del usuario impersonado
      impersonating: impersonationData.originalAdmin?.id, // ID del SUPERADMIN que impersona
      isImpersonating: true
    };
  }

  // Si no hay impersonation, devolver el usuario de la sesión
  return {
    ...session?.user,
    impersonating: null,
    isImpersonating: false
  };
};

"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export const useCurrentUserSimple = () => {
  const { data: session, status } = useSession();
  const [impersonationData, setImpersonationData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Obtener datos de impersonation del localStorage solo en el cliente
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('impersonation');
        const parsed = data ? JSON.parse(data) : null;
        setImpersonationData(parsed);
      } catch (error) {
        console.error('Error parsing impersonation data:', error);
        setImpersonationData(null);
      }
    }
  }, [isClient]);

  // Si no estamos en el cliente, devolver null durante SSR
  if (!isClient) {
    return null;
  }

  // Si la sesión está cargando, devolver null
  if (status === "loading") {
    return null;
  }

  // Si no hay sesión, devolver null
  if (!session?.user) {
    return null;
  }

  // Si hay impersonation activa, devolver el usuario impersonado con el ID del admin
  if (impersonationData?.isActive && impersonationData?.targetUser) {
    return {
      ...impersonationData.targetUser, // Datos del usuario impersonado
      impersonating: impersonationData.originalAdmin?.id, // ID del SUPERADMIN que impersona
      isImpersonating: true
    };
  }
  
  return {
    ...session.user,
    impersonating: null,
    isImpersonating: false
  };
};

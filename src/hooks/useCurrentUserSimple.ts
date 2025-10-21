"use client";

import { useSession } from "next-auth/react";

export const useCurrentUserSimple = () => {
  const { data: session, status } = useSession();

  // Si la sesión está cargando, devolver null
  if (status === "loading") {
    return null;
  }

  // Si no hay sesión, devolver null
  if (!session?.user) {
    return null;
  }

  // Por ahora, devolver solo la sesión sin impersonation
  // TODO: Implementar impersonation más adelante si es necesario
  return {
    ...session.user,
    impersonating: null,
    isImpersonating: false
  };
};
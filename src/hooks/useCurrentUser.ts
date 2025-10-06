import { useSession } from "next-auth/react";
import { useImpersonation } from "./useImpersonation";

export const useCurrentUser = () => {
  const { data: session } = useSession();
  const { isCurrentlyImpersonating, targetUser, originalAdmin } = useImpersonation();

  // Si hay impersonation activa, devolver el usuario objetivo
  if (isCurrentlyImpersonating && targetUser) {
    return {
      ...targetUser,
      isImpersonating: true,
      originalAdmin
    };
  }

  // Si no hay impersonation, devolver el usuario de la sesión
  return {
    ...session?.user,
    isImpersonating: false,
    originalAdmin: null
  };
};

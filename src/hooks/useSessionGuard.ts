"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

/**
 * Hook para proteger rutas que requieren autenticación
 * Redirige al login si no hay sesión o faltan datos críticos
 */
export function useSessionGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si aún está cargando, no hacer nada
    if (status === "loading") return;

    // Si no hay sesión, redirigir al login
    if (status === "unauthenticated" || !session) {
      router.push("/auth/login");
      return;
    }

    // Si hay sesión pero faltan datos críticos del usuario
    if (session && (!session.user || !session.user.email)) {
      console.warn("Sesión incompleta, redirigiendo al login");
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Retornar el estado de carga
  if (status === "loading") {
    return {
      isLoading: true,
      session: null,
      shouldRender: false
    };
  }

  // Si no hay sesión, no renderizar nada (se está redirigiendo)
  if (status === "unauthenticated" || !session) {
    return {
      isLoading: false,
      session: null,
      shouldRender: false
    };
  }

  // Sesión válida
  return {
    isLoading: false,
    session,
    shouldRender: true
  };
}

/**
 * Componente wrapper para páginas que requieren autenticación
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, shouldRender } = useSessionGuard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verificando sesión..." />
      </div>
    );
  }

  if (!shouldRender) {
    return null; // Se está redirigiendo
  }

  return <>{children}</>;
}

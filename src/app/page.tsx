"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // Solo redirigir cuando la sesión esté completamente cargada
    if (status !== "loading") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Mostrar loading mientras se verifica la sesión
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner message="Cargando..." />
    </div>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import TopBar from "./TopBar";
import Header from "./Header";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMountedRef = useRef(true);
  
  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta pública, renderizar sin autenticación
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Verificación simple de sesión
  useEffect(() => {
    if (isMountedRef.current && status === "unauthenticated") {
      // Usar setTimeout para evitar actualizaciones durante el renderizado
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          router.push("/auth/login");
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [status, router]);

  // Mostrar loading mientras verifica sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verificando sesión..." />
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada (se está redirigiendo)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  // Para rutas protegidas con sesión válida
  return (
    <>
      <TopBar />
      <Header />
      <div className="container">
        {children}
      </div>
    </>
  );
}

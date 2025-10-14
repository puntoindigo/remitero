"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  
  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta pública, renderizar sin autenticación
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Redirección simple sin useEffect
  if (status === "unauthenticated") {
    // Usar window.location para evitar problemas con React
    if (typeof window !== 'undefined') {
      window.location.href = "/auth/login";
    }
    return null;
  }

  // Mostrar loading mientras verifica sesión
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Verificando sesión..." />
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada
  if (!session) {
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

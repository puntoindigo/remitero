"use client";

import { usePathname } from "next/navigation";
import { SessionGuard } from "@/hooks/useSessionGuard";
import TopBar from "./TopBar";
import Header from "./Header";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  
  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/error"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta pública, renderizar sin autenticación
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Para rutas protegidas, usar SessionGuard
  return (
    <SessionGuard>
      <TopBar />
      <Header />
      <div className="container">
        {children}
      </div>
    </SessionGuard>
  );
}

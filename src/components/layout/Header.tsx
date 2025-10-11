"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  Building2,
  LogOut,
  FileText
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useImpersonation } from "@/hooks/useImpersonation";

export default function Header() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const { stopImpersonation, isImpersonating } = useImpersonation();
  const pathname = usePathname();

  if (!session) {
    return (
      <header className="header">
        <div className="header-left">
          <h1>Sistema de Remitos</h1>
          <span className="company-name">Sistema de Gestión</span>
        </div>
        <div className="header-right">
          <Link href="/auth/login" className="logout-button">
            <LogOut className="h-4 w-4" />
            Iniciar Sesión
          </Link>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
    } catch (error) {
      console.error('Error al detener impersonation:', error);
    }
  };

  const handleDownloadLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-actions-${new Date().toISOString().split('T')[0]}.log`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Error al descargar logs');
      }
    } catch (error) {
      console.error('Error al descargar logs:', error);
    }
  };

  const NavLink = ({ href, children, roles }: { 
    href: string; 
    children: React.ReactNode; 
    roles?: string[] 
  }) => {
    const isActive = pathname === href;
    const isAllowed = !roles || roles.includes(currentUser.role);
    
    if (!isAllowed) return null;

    return (
      <Link 
        href={href} 
        className={`nav-link ${isActive ? 'active' : ''}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>{currentUser.companyName || 'Sistema de Remitos'}</h1>
        <span className="company-name">Sistema de Remitos</span>
      </div>
      
      <nav className="main-nav">
        <NavLink href="/dashboard" roles={['ADMIN', 'USER']}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink href="/remitos">
          <ReceiptText className="h-4 w-4" />
          Remitos
        </NavLink>
        <NavLink href="/productos">
          <Package className="h-4 w-4" />
          Productos
        </NavLink>
        <NavLink href="/clientes">
          <ShoppingBag className="h-4 w-4" />
          Clientes
        </NavLink>
        <NavLink href="/categorias">
          <Tag className="h-4 w-4" />
          Categorías
        </NavLink>
        <NavLink href="/usuarios" roles={['SUPERADMIN', 'ADMIN']}>
          <Users className="h-4 w-4" />
          Usuarios
        </NavLink>
        <NavLink href="/empresas" roles={['SUPERADMIN']}>
          <Building2 className="h-4 w-4" />
          Empresas
        </NavLink>
        
        <NavLink href="/estados-remitos">
          <Tag className="h-4 w-4" />
          Estados
        </NavLink>
      </nav>
      
      <div className="header-right">
        <span className="user-info">
          {currentUser.name} ({currentUser.role})
          {currentUser.isImpersonating && (
            <span className="impersonation-indicator"> [IMPERSONANDO]</span>
          )}
        </span>
        
        {currentUser.isImpersonating ? (
          <button 
            onClick={handleStopImpersonation} 
            className="logout-button impersonation-logout"
            disabled={isImpersonating}
            title="Volver a mi cuenta de administrador"
          >
            <LogOut className="h-4 w-4" />
            Volver a Admin
          </button>
        ) : (
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        )}
      </div>
    </header>
  );
}
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
  LogOut
} from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return (
      <header className="header">
        <div className="header-left">
          <h1>Sistema de Remitos</h1>
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

  const NavLink = ({ href, children, roles }: { 
    href: string; 
    children: React.ReactNode; 
    roles?: string[] 
  }) => {
    const isActive = pathname === href;
    const isAllowed = !roles || roles.includes(session.user.role);
    
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
        <h1>Sistema de Remitos</h1>
        {session.user.companyName && (
          <span className="company-name">Empresa: {session.user.companyName}</span>
        )}
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
      </nav>
      
      <div className="header-right">
        <span className="user-info">
          {session.user.name} ({session.user.role})
        </span>
        <button onClick={handleLogout} className="logout-button">
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
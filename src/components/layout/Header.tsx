"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useColorTheme } from "@/contexts/ColorThemeContext";
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
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useImpersonation } from "@/hooks/useImpersonation";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useShortcuts } from "@/hooks/useShortcuts";
import { ShortcutText } from "@/components/common/ShortcutText";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";

export default function Header() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { stopImpersonation, isImpersonating } = useImpersonation();
  const { selectedCompanyId } = useDataWithCompanySimple();
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { colors } = useColorTheme();
  const headerRef = useRef<HTMLElement>(null);
  
  // Ocultar módulo Empresas si hay una empresa seleccionada
  const shouldHideEmpresas = !!selectedCompanyId;

  // Aplicar tema al header
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.backgroundImage = colors.gradient;
      headerRef.current.style.backgroundColor = 'transparent';
    }
  }, [colors.gradient]);

  const headerRefNoSession = useRef<HTMLElement>(null);
  
  // Aplicar tema al header sin sesión también
  useEffect(() => {
    if (headerRefNoSession.current) {
      headerRefNoSession.current.style.backgroundImage = colors.gradient;
      headerRefNoSession.current.style.backgroundColor = 'transparent';
    }
  }, [colors.gradient]);

  if (!session || !currentUser) {
    return (
      <header ref={headerRefNoSession} className="header">
        <div className="header-left">
          <span className="header-app-title">Sistema de Remitos</span>
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
    setIsLoggingOut(true);
    try {
      // Redirigir inmediatamente para evitar demoras en compilación
      if (typeof window !== 'undefined') {
        // Hacer logout en background sin esperar ni mostrar errores
        signOut({ redirect: false }).catch(() => {
          // Ignorar errores silenciosamente
        });
        // Pequeño delay para que el signOut se ejecute antes de navegar
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 50);
      }
    } catch (error) {
      // Ignorar errores y redirigir de todas formas
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const handleLogoutRequest = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
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
      const response = await fetch('/api/admin/logs')
            .catch(error => {
                console.error('Error fetching logs:', error);
                throw new Error('Error de conexión con logs');
            });
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

  // Función helper para navegar con manejo de errores y verificación de permisos
  const safeNavigate = (path: string, requiredRoles?: string[]) => {
    try {
      // Verificar permisos si son necesarios
      if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
        console.warn(`Acceso denegado a ${path}. Rol requerido: ${requiredRoles.join(', ')}`);
        return;
      }
      router.push(path);
    } catch (error) {
      console.error('Error al navegar:', error);
    }
  };

  // Configurar shortcuts de navegación con verificación de permisos
  useShortcuts([
    { key: 'd', action: () => safeNavigate('/dashboard', ['ADMIN', 'USER']), description: 'Dashboard' },
    { key: 'r', action: () => safeNavigate('/remitos'), description: 'Remitos' },
    { key: 'c', action: () => safeNavigate('/clientes'), description: 'Clientes' },
    { key: 'p', action: () => safeNavigate('/productos'), description: 'Productos' },
    { key: 't', action: () => safeNavigate('/categorias', ['SUPERADMIN', 'ADMIN']), description: 'Categorías' },
    { key: 'e', action: () => safeNavigate('/estados-remitos', ['SUPERADMIN', 'ADMIN']), description: 'Estados' },
    { key: 'u', action: () => safeNavigate('/usuarios', ['SUPERADMIN', 'ADMIN']), description: 'Usuarios' },
    ...(!shouldHideEmpresas ? [{ key: 'm', action: () => safeNavigate('/empresas', ['SUPERADMIN']), description: 'Empresas' }] : []),
    { key: 's', action: handleLogoutRequest, description: 'Salir' }
  ], !!session && !showLogoutConfirm);

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
    <header ref={headerRef} className="header">
      <div className="header-left">
        <span className="header-app-title">Sistema de Remitos</span>
        {currentUser.companyName ? (
          currentUser.role !== 'SUPERADMIN' && (
            <h1 className="header-company-name">{currentUser.companyName}</h1>
          )
        ) : (
          <h1 className="header-company-name">Sistema de Gestión</h1>
        )}
      </div>
      
      <nav className="main-nav">
        <NavLink href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          <ShortcutText text="Tablero" shortcutKey="d" />
        </NavLink>
        <NavLink href="/remitos">
          <ReceiptText className="h-4 w-4" />
          <ShortcutText text="Remitos" shortcutKey="r" />
        </NavLink>
        <NavLink href="/clientes">
          <ShoppingBag className="h-4 w-4" />
          <ShortcutText text="Clientes" shortcutKey="c" />
        </NavLink>
        <NavLink href="/productos">
          <Package className="h-4 w-4" />
          <ShortcutText text="Productos" shortcutKey="p" />
        </NavLink>
        <NavLink href="/categorias" roles={['SUPERADMIN', 'ADMIN']}>
          <Tag className="h-4 w-4" />
          <ShortcutText text="Categorías" shortcutKey="t" />
        </NavLink>
        <NavLink href="/estados-remitos" roles={['SUPERADMIN', 'ADMIN']}>
          <Tag className="h-4 w-4" />
          <ShortcutText text="Estados" shortcutKey="e" />
        </NavLink>
        <NavLink href="/usuarios" roles={['SUPERADMIN', 'ADMIN']}>
          <Users className="h-4 w-4" />
          <ShortcutText text="Usuarios" shortcutKey="u" />
        </NavLink>
        {!shouldHideEmpresas && (
          <NavLink href="/empresas" roles={['SUPERADMIN']}>
            <Building2 className="h-4 w-4" />
            <ShortcutText text="Empresas" shortcutKey="m" />
          </NavLink>
        )}
      </nav>
      
      <div className="header-right">
        {/* Información del usuario movida al TopBar */}
      </div>

      {/* Modal de confirmación de logout */}
      <DeleteConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
        title="Confirmar Salida"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmButtonText="Aceptar"
        isLoading={isLoggingOut}
      />
    </header>
  );
}
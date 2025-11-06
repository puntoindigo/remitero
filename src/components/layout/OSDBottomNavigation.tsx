"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import {
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  Package,
  Tag,
  Users,
  Building2,
  Settings,
  ChevronUp,
  X,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  roles?: string[];
  submenu?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  roles?: string[];
}

export function OSDBottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ left: number; width: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Estado local para enableBotonera que se sincroniza con la sesión
  const [enableBotonera, setEnableBotonera] = useState<boolean>(
    (session?.user as any)?.enable_botonera ?? false
  );
  const [lastEventValue, setLastEventValue] = useState<boolean | null>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Escuchar eventos de actualización de botonera PRIMERO (prioridad)
  useEffect(() => {
    const handleBotoneraUpdate = (event: CustomEvent) => {
      const newValue = event.detail?.enableBotonera ?? false;
      // Actualizar estado local inmediatamente
      setEnableBotonera(newValue);
      setLastEventValue(newValue);
      console.log('🔄 Botonera actualizada vía evento:', newValue);
    };
    
    window.addEventListener('botonera-updated', handleBotoneraUpdate as EventListener);
    
    return () => {
      window.removeEventListener('botonera-updated', handleBotoneraUpdate as EventListener);
    };
  }, []);
  
  // Sincronizar con la sesión cuando cambie (solo si no hay un evento reciente)
  useEffect(() => {
    const sessionValue = (session?.user as any)?.enable_botonera ?? false;
    // Solo actualizar desde la sesión si no recibimos un evento reciente
    // Esto evita que la sesión sobrescriba el valor del evento
    if (lastEventValue === null || lastEventValue === sessionValue) {
      setEnableBotonera(sessionValue);
    }
  }, [session, lastEventValue]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setSubmenuPosition(null);
      }
    };

    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeMenu]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setActiveMenu(null);
    setSubmenuPosition(null);
  }, [pathname]);
  
  // Early return DESPUÉS de todos los hooks
  if (!isDevelopment || !enableBotonera) {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Tablero",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      id: "operations",
      label: "Operaciones",
      icon: ReceiptText,
      submenu: [
        { id: "remitos", label: "Remitos", path: "/remitos" },
        { id: "clientes", label: "Clientes", path: "/clientes" },
        { id: "productos", label: "Productos", path: "/productos" },
      ],
    },
    {
      id: "configuration",
      label: "Configuración",
      icon: Settings,
      roles: ["SUPERADMIN", "ADMIN"],
      submenu: [
        { id: "categorias", label: "Categorías", path: "/categorias", roles: ["SUPERADMIN", "ADMIN"] },
        { id: "estados", label: "Estados", path: "/estados-remitos", roles: ["SUPERADMIN", "ADMIN"] },
        { id: "usuarios", label: "Usuarios", path: "/usuarios", roles: ["SUPERADMIN", "ADMIN"] },
      ],
    },
    {
      id: "administration",
      label: "Administración",
      icon: Building2,
      path: "/empresas",
      roles: ["SUPERADMIN"],
    },
  ];

  // Filtrar items según roles
  const filteredItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser?.role || "");
  });

  const handleMenuItemClick = (item: MenuItem, event: React.MouseEvent<HTMLButtonElement>) => {
    if (item.submenu) {
      // Si tiene submenu, calcular posición y toggle
      const button = buttonRefs.current[item.id];
      if (button) {
        const rect = button.getBoundingClientRect();
        setSubmenuPosition({
          left: rect.left + rect.width / 2,
          width: rect.width,
        });
      }
      setActiveMenu(activeMenu === item.id ? null : item.id);
    } else if (item.path) {
      // Si tiene path directo, navegar
      router.push(item.path);
      setActiveMenu(null);
      setSubmenuPosition(null);
    }
  };

  const handleSubmenuClick = (path: string, roles?: string[]) => {
    if (roles && !roles.includes(currentUser?.role || "")) {
      return;
    }
    router.push(path);
    setActiveMenu(null);
  };

  const getActiveItem = () => {
    return filteredItems.find((item) => item.id === activeMenu);
  };

  const isItemActive = (item: MenuItem) => {
    if (item.path) {
      return pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some((sub) => {
        if (sub.roles && !sub.roles.includes(currentUser?.role || "")) {
          return false;
        }
        return pathname === sub.path;
      });
    }
    return false;
  };

  return (
    <div ref={menuRef} className="osd-navigation-container">
      {/* Submenú desplegable */}
      {activeMenu && submenuPosition && (
        <div 
          className="osd-submenu"
          style={{
            left: `${submenuPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="osd-submenu-header">
            <span className="osd-submenu-title">{getActiveItem()?.label}</span>
            <button
              onClick={() => {
                setActiveMenu(null);
                setSubmenuPosition(null);
              }}
              className="osd-submenu-close"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="osd-submenu-content">
            {getActiveItem()?.submenu
              ?.filter((sub) => {
                if (!sub.roles) return true;
                return sub.roles.includes(currentUser?.role || "");
              })
              .map((sub) => {
                const isActive = pathname === sub.path;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      handleSubmenuClick(sub.path, sub.roles);
                      setSubmenuPosition(null);
                    }}
                    className={`osd-submenu-item ${isActive ? "active" : ""}`}
                  >
                    <span>{sub.label}</span>
                    {isActive && <div className="osd-submenu-indicator" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Barra de navegación inferior */}
      <nav className="osd-nav-bar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          const isOpen = activeMenu === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => (buttonRefs.current[item.id] = el)}
              onClick={(e) => handleMenuItemClick(item, e)}
              className={`osd-nav-button ${isActive ? "active" : ""} ${isOpen ? "open" : ""}`}
              title={item.label}
            >
              <div className="osd-nav-button-icon">
                <Icon className="h-6 w-6" />
              </div>
              <span className="osd-nav-button-label">{item.label}</span>
              {item.submenu && (
                <div className={`osd-nav-button-indicator ${isOpen ? "open" : ""}`}>
                  <ChevronUp className="h-4 w-4" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <style jsx>{`
        .osd-navigation-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          pointer-events: none;
        }

        .osd-nav-bar {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 12px;
          padding: 16px 24px;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.95) 0%,
            rgba(15, 23, 42, 0.85) 50%,
            rgba(15, 23, 42, 0) 100%
          );
          backdrop-filter: blur(20px);
          pointer-events: auto;
        }

        .osd-nav-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          min-width: 90px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .osd-nav-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${colors.gradient};
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .osd-nav-button:hover {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.95);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .osd-nav-button:hover::before {
          opacity: 0.15;
        }

        .osd-nav-button.active {
          background: rgba(30, 41, 59, 0.95);
          border-color: ${colors.primary}80;
          color: #fff;
          box-shadow: 0 0 20px ${colors.primary}40, 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .osd-nav-button.active::before {
          opacity: 0.25;
        }

        .osd-nav-button.open {
          background: rgba(30, 41, 59, 0.98);
          border-color: ${colors.primary};
          color: #fff;
          box-shadow: 0 0 24px ${colors.primary}50, 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .osd-nav-button.open::before {
          opacity: 0.3;
        }

        .osd-nav-button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .osd-nav-button:hover .osd-nav-button-icon,
        .osd-nav-button.active .osd-nav-button-icon,
        .osd-nav-button.open .osd-nav-button-icon {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .osd-nav-button-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .osd-nav-button-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          opacity: 0;
          transform: rotate(180deg) scale(0);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .osd-nav-button:hover .osd-nav-button-indicator,
        .osd-nav-button.open .osd-nav-button-indicator {
          opacity: 1;
          transform: rotate(0deg) scale(1);
        }

        .osd-submenu {
          position: fixed;
          bottom: 100px;
          min-width: 280px;
          max-width: 90vw;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          pointer-events: auto;
          animation: osdSubmenuSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10000;
        }

        @keyframes osdSubmenuSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .osd-submenu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .osd-submenu-title {
          font-size: 16px;
          font-weight: 600;
          color: ${colors.primary};
          letter-spacing: 0.5px;
        }

        .osd-submenu-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .osd-submenu-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .osd-submenu-content {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .osd-submenu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
          width: 100%;
        }

        .osd-submenu-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .osd-submenu-item.active {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .osd-submenu-item.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: ${colors.primary};
          border-radius: 0 2px 2px 0;
        }

        .osd-submenu-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${colors.primary};
          box-shadow: 0 0 8px ${colors.primary}80;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .osd-nav-bar {
            gap: 8px;
            padding: 12px 16px;
          }

          .osd-nav-button {
            min-width: 70px;
            padding: 10px 12px;
            gap: 6px;
          }

          .osd-nav-button-icon {
            width: 40px;
            height: 40px;
          }

          .osd-nav-button-label {
            font-size: 11px;
          }

          .osd-submenu {
            min-width: 240px;
            max-width: 95vw;
          }
        }
      `}</style>
    </div>
  );
}


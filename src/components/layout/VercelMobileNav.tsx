"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUserSimple } from '@/hooks/useCurrentUserSimple';
import {
  LayoutDashboard,
  ReceiptText,
  ShoppingBag,
  Package,
  Plus,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  roles?: string[];
}

export function VercelMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Abrir automáticamente en mobile

  // Detectar qué página está activa para mostrar el botón + correcto
  const getNewPath = () => {
    if (pathname === '/remitos' || pathname.startsWith('/remitos/')) {
      return '/remitos?openForm=true';
    }
    if (pathname === '/clientes' || pathname.startsWith('/clientes/')) {
      return '/clientes?openForm=true';
    }
    if (pathname === '/productos' || pathname.startsWith('/productos/')) {
      return '/productos?openForm=true';
    }
    if (pathname === '/categorias' || pathname.startsWith('/categorias/')) {
      return '/categorias?openForm=true';
    }
    return null;
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tablero',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['ADMIN', 'USER'],
    },
    {
      id: 'remitos',
      label: 'Remitos',
      icon: ReceiptText,
      path: '/remitos',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: ShoppingBag,
      path: '/clientes',
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: Package,
      path: '/productos',
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser?.role || '');
  });

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleNewClick = () => {
    const newPath = getNewPath();
    if (newPath) {
      router.push(newPath);
    }
  };

  const hasNewButton = !!getNewPath();

  return (
    <>
      {/* Header minimalista - estilo Vercel */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo a la izquierda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/dashboard')}
        >
          Gestión
        </div>

        {/* Menú hamburguesa minimalista */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Menu size={24} color="#111827" />
        </button>
      </header>

      {/* Menú lateral */}
      {isMenuOpen && (
        <>
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '350px',
              zIndex: 999,
            }}
          >
            <MobileMenu onClose={() => setIsMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Bottom Navigation - estilo Vercel: más grande, iconos grandes */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
        }}
      >
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: active ? '#111827' : '#6b7280',
                transition: 'color 0.2s',
                flex: 1,
                minWidth: 0,
              }}
            >
              <Icon size={32} strokeWidth={active ? 2.5 : 2} />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}

      </nav>
    </>
  );
}

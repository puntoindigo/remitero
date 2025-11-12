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

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  newPath?: string;
  roles?: string[];
}

export function VercelMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUserSimple();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      newPath: '/remitos?openForm=true',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: ShoppingBag,
      path: '/clientes',
      newPath: '/clientes?openForm=true',
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: Package,
      path: '/productos',
      newPath: '/productos?openForm=true',
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser?.role || '');
  });

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleNewClick = (newPath?: string) => {
    if (newPath) {
      router.push(newPath);
    }
  };

  return (
    <>
      {/* Header fijo arriba - estilo Vercel */}
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
          onClick={() => {
            router.push('/dashboard');
          }}
        >
          Gestión
        </div>

        {/* Menú hamburguesa a la derecha */}
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

      {/* Bottom Navigation - estilo Vercel con iconos grandes */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '72px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 0',
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasNew = !!item.newPath;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                position: 'relative',
                gap: '4px',
              }}
            >
              {/* Botón principal de navegación */}
              <button
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: active ? '#111827' : '#6b7280',
                  transition: 'color 0.2s',
                  width: '100%',
                }}
              >
                <Icon size={28} strokeWidth={active ? 2.5 : 2} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: active ? 600 : 400,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </span>
              </button>

              {/* Botón + flotante para crear nuevo */}
              {hasNew && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewClick(item.newPath);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '8px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                    fontSize: '18px',
                    fontWeight: 600,
                    padding: 0,
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.4)';
                  }}
                  title={`Nuevo ${item.label.slice(0, -1)}`}
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}


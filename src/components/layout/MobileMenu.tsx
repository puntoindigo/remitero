"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useCurrentUserSimple } from '@/hooks/useCurrentUserSimple';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface MenuItem {
  name: string;
  path: string;
  icon: string;
  emoji: string;
  requiredRoles?: string[];
}

interface MobileMenuProps {
  onClose?: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps = { onClose: undefined }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();

  useEffect(() => {
    setIsOpen(false);
    onClose?.();
  }, [pathname, onClose]);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', emoji: '🏠' },
    { name: 'Remitos', path: '/remitos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', emoji: '📄' },
    { name: 'Clientes', path: '/clientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', emoji: '👥' },
    { name: 'Productos', path: '/productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', emoji: '📦' },
    { name: 'Categorías', path: '/categorias', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', emoji: '🏷️', requiredRoles: ['SUPERADMIN', 'ADMIN'] },
    { name: 'Estados', path: '/estados-remitos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', emoji: '🔄', requiredRoles: ['SUPERADMIN', 'ADMIN'] },
    { name: 'Usuarios', path: '/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', emoji: '👤', requiredRoles: ['SUPERADMIN', 'ADMIN'] },
    { name: 'Empresas', path: '/empresas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', emoji: '🏢', requiredRoles: ['SUPERADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(currentUser?.role || '');
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <>
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .menu-item-enter {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>

      {/* Drawer Menu - el contenedor y overlay están en VercelMobileNav */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: colors.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundColor: colors.primary || '#667eea',
          overflowY: 'auto',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                Menú
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                {currentUser?.name || 'Usuario'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose?.();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                transition: 'all 0.2s',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '16px 0' }}>
          {filteredItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  onClose?.();
                }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  color: 'white',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '16px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '4px solid white' : '4px solid transparent',
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                <span>{item.name}</span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', fontSize: '12px' }}>●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoggingOut ? 'rgba(200, 200, 200, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '12px',
              color: '#764ba2',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              opacity: isLoggingOut ? 0.7 : 1
            }}
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cerrando sesión...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </>
            )}
          </button>
        </div>
      </div>

    </>
  );
}




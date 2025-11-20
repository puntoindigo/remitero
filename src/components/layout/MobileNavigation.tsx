"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Users, Package, Plus } from 'lucide-react';
import Link from 'next/link';

export function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Tablero', 
      icon: Home,
      newPath: null
    },
    { 
      path: '/remitos', 
      label: 'Remitos', 
      icon: FileText,
      newPath: '/remitos/nuevo'
    },
    { 
      path: '/clientes', 
      label: 'Clientes', 
      icon: Users,
      newPath: '/clientes/nuevo'
    },
    { 
      path: '/productos', 
      label: 'Productos', 
      icon: Package,
      newPath: '/productos/nuevo'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  const handlePlusClick = (newPath: string | null) => {
    if (newPath) {
      router.push(newPath);
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '0.5rem 0',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <div key={item.path} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Link
                href={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  textDecoration: 'none',
                  color: active ? '#3b82f6' : '#6b7280',
                  width: '100%',
                  transition: 'color 0.2s',
                }}
              >
                <Icon 
                  size={24} 
                  style={{ 
                    marginBottom: '0.25rem',
                    strokeWidth: active ? 2.5 : 2
                  }} 
                />
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: active ? 600 : 400,
                  textAlign: 'center'
                }}>
                  {item.label}
                </span>
              </Link>
              
            </div>
          );
        })}
      </div>
    </nav>
  );
}


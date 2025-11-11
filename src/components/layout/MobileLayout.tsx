"use client";

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { MobileNavigation } from './MobileNavigation';
import { useCurrentUserSimple } from '@/hooks/useCurrentUserSimple';
import { Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      paddingBottom: '80px', // Espacio para la navegación inferior
      paddingTop: '60px', // Espacio para el encabezado
    }}>
      {/* Encabezado fijo */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {currentUser?.name || session?.user?.name || 'Usuario'}
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280' 
          }}>
            {currentUser?.email || session?.user?.email || ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => window.location.href = '/configuracion'}
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            title="Configuración"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main style={{ 
        padding: '1rem',
        maxWidth: '100%',
        margin: '0 auto',
      }}>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}


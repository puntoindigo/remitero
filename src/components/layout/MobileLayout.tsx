"use client";

import { ReactNode } from 'react';
import { MobileNavigation } from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      paddingBottom: '80px', // Espacio para la navegación inferior
    }}>
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


"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useColorTheme } from '@/contexts/ColorThemeContext';
import { Menu, X } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

export function VercelMobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { colors } = useColorTheme();

  return (
    <>
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
            const router = useRouter();
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
          {isMenuOpen ? (
            <X size={24} color="#111827" />
          ) : (
            <Menu size={24} color="#111827" />
          )}
        </button>
      </header>

      {/* Menú lateral */}
      {isMenuOpen && <MobileMenu />}
    </>
  );
}


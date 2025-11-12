"use client";

import { useColorTheme } from '@/contexts/ColorThemeContext';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

export function FloatingActionButton({ onClick, label, icon }: FABProps) {
  const { colors } = useColorTheme();
  return (
    <button
      onClick={onClick}
      className="floating-action-button"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: 'none',
        background: colors.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundColor: colors.primary || '#667eea',
        boxShadow: `0 8px 24px ${colors.primary || '#667eea'}40, 0 4px 8px rgba(0, 0, 0, 0.2)`,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 996,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${colors.primary || '#667eea'}60, 0 6px 12px rgba(0, 0, 0, 0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary || '#667eea'}40, 0 4px 8px rgba(0, 0, 0, 0.2)`;
      }}
      title={label}
    >
      {icon ? <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{icon}</span> : <Plus size={28} strokeWidth={3} />}
      
      {/* Label tooltip */}
      <span style={{
        position: 'absolute',
        right: '76px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
      }}
      className="fab-label">
        {label}
      </span>

      <style jsx>{`
        .floating-action-button:hover .fab-label {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .floating-action-button {
            width: 56px !important;
            height: 56px !important;
            bottom: 100px !important; /* Arriba de la botonera (80px + 20px) */
            right: 16px !important;
            z-index: 1001 !important; /* Arriba de la botonera */
          }
        }
      `}</style>
    </button>
  );
}






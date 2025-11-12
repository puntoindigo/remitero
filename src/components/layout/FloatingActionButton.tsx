"use client";

import { useColorTheme } from '@/contexts/ColorThemeContext';
import { Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface FABProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

export function FloatingActionButton({ onClick, label, icon }: FABProps) {
  const { colors } = useColorTheme();
  const [position, setPosition] = useState({ bottom: 100, right: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cargar posición guardada
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fab-position');
      if (saved) {
        try {
          const { bottom, right } = JSON.parse(saved);
          setPosition({ bottom: bottom || 100, right: right || 16 });
        } catch (e) {
          // Si hay error, usar valores por defecto
        }
      }
    }
  }, []);

  // Guardar posición
  const savePosition = (bottom: number, right: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fab-position', JSON.stringify({ bottom, right }));
    }
  };

  // Manejar inicio de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    e.preventDefault();
  };

  // Manejar arrastre
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = dragStart.x - e.clientX;
      const deltaY = dragStart.y - e.clientY;

      const newRight = Math.max(8, Math.min(window.innerWidth - 64, position.right + deltaX));
      const newBottom = Math.max(100, Math.min(window.innerHeight - 200, position.bottom - deltaY));

      setPosition({ bottom: newBottom, right: newRight });
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePosition(position.bottom, position.right);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  // Manejar touch para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const deltaX = dragStart.x - touch.clientX;
      const deltaY = dragStart.y - touch.clientY;

      const newRight = Math.max(8, Math.min(window.innerWidth - 64, position.right + deltaX));
      const newBottom = Math.max(100, Math.min(window.innerHeight - 200, position.bottom - deltaY));

      setPosition({ bottom: newBottom, right: newRight });
      setDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      savePosition(position.bottom, position.right);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, position]);

  return (
    <button
      ref={buttonRef}
      onClick={isDragging ? undefined : onClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="floating-action-button"
      style={{
        position: 'fixed',
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        background: colors.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundColor: colors.primary || '#667eea',
        boxShadow: `0 8px 24px ${colors.primary || '#667eea'}40, 0 4px 8px rgba(0, 0, 0, 0.2)`,
        color: 'white',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = `0 12px 32px ${colors.primary || '#667eea'}60, 0 6px 12px rgba(0, 0, 0, 0.3)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary || '#667eea'}40, 0 4px 8px rgba(0, 0, 0, 0.2)`;
        }
      }}
      title={isDragging ? 'Suelta para guardar posición' : label}
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
            left: auto !important;
            transform: none !important;
          }
        }
      `}</style>
    </button>
  );
}

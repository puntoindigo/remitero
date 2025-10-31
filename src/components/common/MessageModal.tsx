'use client';

import { useEffect } from 'react';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
}

export function MessageModal({ isOpen, onClose, type, title, message, details }: MessageModalProps) {
  const { colors } = useColorTheme();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Detectar tecla ENTER para cerrar el modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  // Detectar títulos genéricos que deben ocultarse
  const isGenericTitle = (title: string): boolean => {
    const genericTitles = [
      'Éxito',
      '¡Operación Exitosa!',
      'Operación Exitosa',
      'Éxito!',
      'Exito',
      'Exito!'
    ];
    return !title || genericTitles.includes(title.trim());
  };

  const shouldHideTitle = isGenericTitle(title);
  const displayMessage = shouldHideTitle ? message : title;
  const hasSecondaryMessage = !shouldHideTitle && message;

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md">
        <div className="modal-content" style={{ padding: '0' }}>
          {/* Header con ícono grande centrado */}
          <div className={`${styles.bgColor} ${styles.borderColor} border-b-2 px-6 py-8 text-center`}>
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full ${styles.bgColor} border-4 ${styles.borderColor} flex items-center justify-center`}>
                <span className={`${styles.iconColor}`} style={{ fontSize: '3rem' }}>
                  {styles.icon}
                </span>
              </div>
            </div>
            {/* Mostrar mensaje con estilo de título si es genérico, o título normal si no lo es */}
            {displayMessage && (
              <h3 className={`text-2xl font-bold ${styles.titleColor} ${hasSecondaryMessage ? 'mb-2' : ''}`}>
                {displayMessage}
              </h3>
            )}
          </div>
          
          {/* Mensaje secundario (solo si hay título no genérico y mensaje adicional) */}
          {hasSecondaryMessage && (
            <div className="px-6 py-6 text-center">
              <p className="text-gray-700 text-lg leading-relaxed">
                {message}
              </p>
            </div>
          )}
          
          {/* Detalles adicionales (técnicos) */}
          {details && (
            <div className="px-6 pb-4">
              <div className="p-3 bg-gray-100 rounded text-sm text-gray-600 font-mono">
                <strong>Detalles técnicos:</strong>
                <pre className="whitespace-pre-wrap mt-1">{details}</pre>
              </div>
            </div>
          )}
          
          {/* Footer con botón */}
          <div className="px-6 pb-6 flex justify-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: colors.gradient,
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Entendido
            </button>
          </div>
          
          {/* Hint de Enter */}
          <div className="px-6 pb-4 text-center">
            <span className="text-xs text-gray-400">
              Presiona <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-600 font-mono">Enter</kbd> para cerrar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useColorTheme } from "@/contexts/ColorThemeContext";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmButtonText?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que deseas eliminar este elemento?",
  itemName,
  confirmButtonText = "Eliminar",
  isLoading = false
}: DeleteConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useColorTheme();

  // Resetear isProcessing cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (isProcessing || isLoading) return;
    setIsProcessing(true);
    try {
      await onConfirm();
      // Si la operación fue exitosa, el modal debería cerrarse
      // No resetear isProcessing aquí porque el componente puede cerrarse
    } catch (error) {
      // Si hay un error, restablecer el estado para permitir reintentar
      setIsProcessing(false);
      console.error('Error en confirmación:', error);
      // No propagar el error para que el modal se mantenga abierto y permita reintentar
    }
  };

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Detectar teclas ENTER (confirmar) y ESC (cancelar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isProcessing && !isLoading) {
        event.preventDefault();
        event.stopPropagation();
        handleConfirm();
      } else if (event.key === 'Escape' && !isProcessing && !isLoading) {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onConfirm, onCancel, isProcessing, isLoading, handleConfirm]);

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget && !isProcessing && !isLoading) {
          onCancel();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="confirm-modal"
        onClick={(e) => {
          // Prevenir que los clicks dentro del modal cierren el overlay
          e.stopPropagation();
        }}
        style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10001,
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ padding: '20px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>{title}</h3>
          <button 
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="modal-close" 
            type="button"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: (isProcessing || isLoading) ? 'not-allowed' : 'pointer',
              color: (isProcessing || isLoading) ? '#9ca3af' : '#6b7280',
              opacity: (isProcessing || isLoading) ? 0.5 : 1
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body" style={{ padding: '20px', paddingTop: '16px' }}>
          <p style={{ margin: '0', color: '#374151', fontSize: '16px' }}>{message}</p>
          {itemName && (
            <p style={{ margin: '10px 0 0 0', fontWeight: '500', color: '#111827', fontSize: '16px' }}>"{itemName}"</p>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="btn-secondary"
            type="button"
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: (isProcessing || isLoading) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: (isProcessing || isLoading) ? 0.5 : 1
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className="btn-danger"
            type="button"
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: (isProcessing || isLoading) ? '#9ca3af' : colors.gradient,
              color: 'white',
              cursor: (isProcessing || isLoading) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '100px',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginRight: 0
            }}
            onMouseEnter={(e) => {
              if (!isProcessing && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {(isProcessing || isLoading) ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}


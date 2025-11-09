"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  confirmText?: string;
  confirmButtonText?: string; // Alias para confirmText
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  confirmButtonText,
  cancelText = 'Cancelar',
  isLoading = false
}: ConfirmationModalProps) {
  // Usar onCancel si está disponible, sino onClose
  const handleCancel = onCancel || onClose || (() => {});
  // Usar confirmButtonText si está disponible, sino confirmText
  const finalConfirmText = confirmButtonText || confirmText;
  
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

  // Manejar tecla ESC para cerrar
  useEffect(() => {
    if (!isOpen || isLoading) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, isLoading, handleCancel]);

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Info className="h-8 w-8 text-blue-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget && !isLoading) {
          handleCancel();
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
        className="modal"
        onClick={(e) => {
          // Prevenir que los clicks dentro del modal cierren el overlay
          e.stopPropagation();
        }}
        style={{
          position: 'relative',
          zIndex: 10001,
        }}
      >
        <div className="modal-header" style={{ overflow: 'visible' }}>
          <div className="flex items-center gap-4" style={{ alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {getIcon()}
            </div>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
        </div>
        
        <div className="modal-body">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium disabled:opacity-50 ${getButtonClass()}`}
          >
            {isLoading ? 'Procesando...' : finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

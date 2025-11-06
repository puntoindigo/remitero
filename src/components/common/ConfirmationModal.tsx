"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false
}: ConfirmationModalProps) {
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
          onClose();
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
        <div className="modal-header">
          <div className="flex items-center gap-4">
            {getIcon()}
            <h2>{title}</h2>
          </div>
        </div>
        
        <div className="modal-body">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium disabled:opacity-50 ${getButtonClass()}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

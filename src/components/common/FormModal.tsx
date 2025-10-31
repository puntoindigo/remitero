"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  isSubmitting?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  modalClassName?: string;
  nested?: boolean; // Si es true, no renderiza <form> (para evitar anidamiento)
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Guardar",
  isSubmitting = false,
  showCancel = true,
  cancelText = "Cancelar",
  modalClassName = "",
  nested = false
}: FormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus en el primer input cuando se abre el modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Esperar a que el DOM se renderice completamente
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, select'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className={`modal form-modal ${modalClassName}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body">
          {nested ? (
            // Cuando está anidado, solo renderizar children sin envolver en form
            // El children (ClienteForm) ya tiene su propio form
            <>
              {children}
            </>
          ) : onSubmit ? (
            <form onSubmit={onSubmit}>
              {children}
              
              <div className="modal-footer">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {showCancel && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                      disabled={isSubmitting}
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : submitText}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              {children}
              <div className="modal-footer">
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {showCancel && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      {cancelText}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

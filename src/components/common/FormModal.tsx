"use client";

import React from "react";
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
  cancelText = "Cancelar"
}: FormModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal form-modal">
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
          {onSubmit ? (
            <form onSubmit={onSubmit}>
              {children}
              
              <div className="modal-footer">
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
            </form>
          ) : (
            <>
              {children}
              <div className="modal-footer">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

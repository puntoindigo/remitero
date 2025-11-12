"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Pin } from "lucide-react";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import { usePinnedModals } from "@/hooks/usePinnedModals";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";

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
  modalId?: string; // ID único para identificar el modal (para anclar)
  modalType?: 'form' | 'list'; // Tipo de modal
  modalComponent?: string; // Nombre del componente (ej: 'RemitoForm', 'ProductoForm')
  modalProps?: any; // Props adicionales para guardar cuando se ancla
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
  nested = false,
  modalId,
  modalType = 'form',
  modalComponent,
  modalProps
}: FormModalProps) {
  const { colors } = useColorTheme();
  const { pinModal, unpinModal, isPinned } = usePinnedModals();
  const currentUser = useCurrentUserSimple();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Verificar si los modales anclados están habilitados
  const pinnedModalsEnabled = (currentUser as any)?.enable_pinned_modals ?? false;
  
  // Generar ID único si no se proporciona
  const uniqueModalId = modalId || `${modalComponent || 'modal'}-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const pinned = isPinned(uniqueModalId);

  // Mostrar overlay y modal inmediatamente cuando se abre
  useEffect(() => {
    if (isOpen) {
      // Mostrar ambos inmediatamente para overlay sólido
      setShowOverlay(true);
      setShowModal(true);
    } else {
      // Al cerrar, ocultar ambos
      setShowOverlay(false);
      setShowModal(false);
    }
  }, [isOpen]);

  // Auto-focus en el primer input cuando se abre el modal (solo en desktop)
  useEffect(() => {
    if (isOpen && modalRef.current && showModal) {
      // No hacer autofocus en mobile para evitar que se abra el teclado
      const isMobile = window.innerWidth <= 768;
      if (isMobile) return;
      
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
  }, [isOpen, showModal]);

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

  if (!isOpen && !showModal) return null;

  // Renderizar en portal para evitar problemas de z-index y overflow
  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget) {
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
        ref={modalRef} 
        className={`modal form-modal ${modalClassName}`}
        onClick={(e) => {
          // Prevenir que los clicks dentro del modal cierren el overlay
          e.stopPropagation();
        }}
        style={{
          position: 'relative',
          zIndex: 10001,
          backgroundColor: 'white',
          borderRadius: modalClassName === 'perfil-modal' ? '0.75rem' : '8px',
          width: modalClassName === 'perfil-modal' ? '100%' : 'fit-content',
          minWidth: '300px',
          maxWidth: modalClassName === 'perfil-modal' ? '700px' : '90vw',
          maxHeight: modalClassName === 'perfil-modal' ? '85vh' : '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div 
          className="modal-header"
          style={modalClassName === 'perfil-modal' ? {
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          } : {}}
        >
          <div>
            <h3 style={modalClassName === 'perfil-modal' ? {
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#1f2937',
              margin: 0
            } : {}}>{title}</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Botón para anclar/desanclar modal - Solo si está habilitado */}
            {pinnedModalsEnabled && modalId && modalComponent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (pinned) {
                    unpinModal(uniqueModalId);
                  } else {
                    pinModal({
                      id: uniqueModalId,
                      title,
                      type: modalType,
                      component: modalComponent,
                      props: modalProps || {}
                    });
                  }
                }}
                className="modal-close"
                aria-label={pinned ? "Desanclar del panel" : "Anclar al panel"}
                title={pinned ? "Quitar del Panel de Control" : "Agregar al Panel de Control"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: pinned ? colors.primary : '#6b7280',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = pinned ? colors.primary : '#6b7280';
                }}
              >
                <Pin 
                  className="h-4 w-4" 
                  style={{
                    fill: pinned ? colors.primary : 'none',
                    stroke: pinned ? colors.primary : 'currentColor',
                  }}
                />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="modal-close"
              aria-label="Cerrar"
              style={modalClassName === 'perfil-modal' ? {
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
              } : {}}
              onMouseEnter={modalClassName === 'perfil-modal' ? (e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              } : undefined}
              onMouseLeave={modalClassName === 'perfil-modal' ? (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              } : undefined}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="modal-body" style={modalClassName === 'perfil-modal' ? { padding: '1.25rem' } : { padding: '1rem 0' }}>
          {nested ? (
            // Cuando está anidado, solo renderizar children sin envolver en form
            // El children (ClienteForm) ya tiene su propio form
            <>
              {children}
            </>
          ) : onSubmit ? (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {children}
              
              <div 
                className="modal-footer" 
                style={modalClassName === 'perfil-modal' ? {
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                } : {
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem'
                }}
              >
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
                    style={modalClassName === 'perfil-modal' ? {
                      padding: '0.5rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: '#fff',
                      background: colors.gradient,
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    } : {
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      background: isSubmitting ? '#9ca3af' : colors.gradient,
                      color: 'white',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      minWidth: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        if (modalClassName === 'perfil-modal') {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}40`;
                        } else {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isSubmitting ? "Guardando..." : submitText}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              {children}
              <div className="modal-footer" style={{ marginTop: '0.5rem', paddingTop: '0.5rem' }}>
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

  return createPortal(modalContent, document.body);
}

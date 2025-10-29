'use client';

import { useState, useCallback } from 'react';

interface MessageModalState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
}

export function useMessageModal() {
  const [modalState, setModalState] = useState<MessageModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    details: undefined
  });

  const showSuccess = useCallback((messageOrTitle: string, message?: string, details?: string) => {
    // Si solo se pasa un parámetro, usarlo como mensaje y generar título automático
    const finalTitle = message ? messageOrTitle : '¡Operación Exitosa!';
    const finalMessage = message ? message : messageOrTitle;
    
    setModalState({
      isOpen: true,
      type: 'success',
      title: finalTitle,
      message: finalMessage,
      details
    });
  }, []);

  const showError = useCallback((messageOrTitle: string, message?: string, details?: string) => {
    // Si solo se pasa un parámetro, usarlo como mensaje y generar título automático
    const finalTitle = message ? messageOrTitle : '¡Ups! Algo salió mal';
    const finalMessage = message ? message : messageOrTitle;
    
    setModalState({
      isOpen: true,
      type: 'error',
      title: finalTitle,
      message: finalMessage,
      details
    });
  }, []);

  const showWarning = useCallback((messageOrTitle: string, message?: string, details?: string) => {
    // Si solo se pasa un parámetro, usarlo como mensaje y generar título automático
    const finalTitle = message ? messageOrTitle : '¡Atención!';
    const finalMessage = message ? message : messageOrTitle;
    
    setModalState({
      isOpen: true,
      type: 'warning',
      title: finalTitle,
      message: finalMessage,
      details
    });
  }, []);

  const showInfo = useCallback((messageOrTitle: string, message?: string, details?: string) => {
    // Si solo se pasa un parámetro, usarlo como mensaje y generar título automático
    const finalTitle = message ? messageOrTitle : 'Información';
    const finalMessage = message ? message : messageOrTitle;
    
    setModalState({
      isOpen: true,
      type: 'info',
      title: finalTitle,
      message: finalMessage,
      details
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalState,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeModal
  };
}

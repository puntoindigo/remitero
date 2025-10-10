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

  const showSuccess = useCallback((title: string, message: string, details?: string) => {
    setModalState({
      isOpen: true,
      type: 'success',
      title,
      message,
      details
    });
  }, []);

  const showError = useCallback((title: string, message: string, details?: string) => {
    setModalState({
      isOpen: true,
      type: 'error',
      title,
      message,
      details
    });
  }, []);

  const showWarning = useCallback((title: string, message: string, details?: string) => {
    setModalState({
      isOpen: true,
      type: 'warning',
      title,
      message,
      details
    });
  }, []);

  const showInfo = useCallback((title: string, message: string, details?: string) => {
    setModalState({
      isOpen: true,
      type: 'info',
      title,
      message,
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

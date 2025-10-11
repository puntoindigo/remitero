"use client";

import { useState } from "react";

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onConfirm: (() => void) | null;
  isLoading: boolean;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    isLoading: false
  });

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    setState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      isLoading: false
    });
  };

  const showSuccess = (title: string, message: string, onConfirm: () => void) => {
    showConfirmation(title, message, onConfirm, 'success');
  };

  const showWarning = (title: string, message: string, onConfirm: () => void) => {
    showConfirmation(title, message, onConfirm, 'warning');
  };

  const showError = (title: string, message: string, onConfirm: () => void) => {
    showConfirmation(title, message, onConfirm, 'error');
  };

  const close = () => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
      isLoading: false
    }));
  };

  const confirm = async () => {
    if (state.onConfirm) {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await state.onConfirm();
        close();
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw error;
      }
    }
  };

  return {
    ...state,
    showConfirmation,
    showSuccess,
    showWarning,
    showError,
    close,
    confirm
  };
}

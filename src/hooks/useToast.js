import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { id, type, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showToast('success', message, duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast('error', message, duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast('info', message, duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast('warning', message, duration);
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  };
}


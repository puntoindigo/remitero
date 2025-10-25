"use client";

import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface UseLoadingReturn {
  loading: LoadingState;
  setLoading: (loading: boolean, message?: string, progress?: number) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
}

export function useLoading(initialState: LoadingState = { isLoading: false }): UseLoadingReturn {
  const [loading, setLoadingState] = useState<LoadingState>(initialState);

  const setLoading = useCallback((isLoading: boolean, message?: string, progress?: number) => {
    setLoadingState({
      isLoading,
      message: message || loading.message,
      progress: progress !== undefined ? progress : loading.progress
    });
  }, [loading.message, loading.progress]);

  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      message: message || 'Cargando...',
      progress: 0
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      message: undefined,
      progress: undefined
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }));
  }, []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    setProgress,
    setMessage
  };
}

"use client";

import { useState, useEffect } from 'react';

export interface PinnedModal {
  id: string;
  title: string;
  type: 'form' | 'list';
  component: string; // 'RemitoForm', 'ProductoForm', etc.
  props?: any; // Props necesarias para renderizar el modal
}

const STORAGE_KEY = 'pinnedModals';

export function usePinnedModals() {
  const [pinnedModals, setPinnedModals] = useState<PinnedModal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar modales anclados desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setPinnedModals(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading pinned modals:', error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Guardar modales anclados en localStorage
  const savePinnedModals = (modals: PinnedModal[]) => {
    setPinnedModals(modals);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(modals));
      } catch (error) {
        console.error('Error saving pinned modals:', error);
      }
    }
  };

  // Anclar un modal
  const pinModal = (modal: PinnedModal) => {
    const updated = [...pinnedModals, modal];
    savePinnedModals(updated);
  };

  // Desanclar un modal
  const unpinModal = (modalId: string) => {
    const updated = pinnedModals.filter(m => m.id !== modalId);
    savePinnedModals(updated);
  };

  // Verificar si un modal está anclado
  const isPinned = (modalId: string): boolean => {
    return pinnedModals.some(m => m.id === modalId);
  };

  // Obtener un modal anclado
  const getPinnedModal = (modalId: string): PinnedModal | undefined => {
    return pinnedModals.find(m => m.id === modalId);
  };

  return {
    pinnedModals,
    isLoaded,
    pinModal,
    unpinModal,
    isPinned,
    getPinnedModal,
    savePinnedModals,
  };
}


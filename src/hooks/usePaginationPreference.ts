"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export type PaginationOption = 10 | 25 | 50 | 100;

const DEFAULT_PAGINATION = 10;

export function usePaginationPreference() {
  const { data: session, update } = useSession();
  const [itemsPerPage, setItemsPerPage] = useState<PaginationOption>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo cargar si el usuario es ADMIN o SUPERADMIN
    if (session?.user && (session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN')) {
      loadPaginationPreference();
    } else {
      setItemsPerPage(DEFAULT_PAGINATION);
      setLoading(false);
    }
  }, [session]);

  const loadPaginationPreference = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        const pagination = data.user?.paginationItemsPerPage || data.paginationItemsPerPage;
        if (pagination && [10, 25, 50, 100].includes(pagination)) {
          setItemsPerPage(pagination as PaginationOption);
        }
      }
    } catch (error) {
      console.error('Error loading pagination preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaginationPreference = async (newValue: PaginationOption) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paginationItemsPerPage: newValue
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la preferencia de paginación');
      }

      setItemsPerPage(newValue);
      // Actualizar la sesión para reflejar el cambio
      await update();
      return true;
    } catch (error) {
      console.error('Error updating pagination preference:', error);
      return false;
    }
  };

  return {
    itemsPerPage,
    updatePaginationPreference,
    loading,
    isAdmin: session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'
  };
}


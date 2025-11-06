"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...categoryKeys.lists(), { companyId }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Fetch categorias
async function fetchCategorias(companyId: string): Promise<Category[]> {
  const response = await fetch(`/api/categories?companyId=${companyId}`);
  if (!response.ok) {
    throw new Error('Error al cargar categorías');
  }
  return response.json();
}

// Hook principal
export function useCategoriasQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.list(companyId),
    queryFn: () => fetchCategorias(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutos - las categorías cambian muy poco
  });
}

// Mutation para crear categoría
export function useCreateCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al crear categoría');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.lists(),
        refetchType: 'active'
      });
    },
  });
}

// Mutation para actualizar categoría
export function useUpdateCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al actualizar categoría');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.lists(),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.detail(variables.id),
        refetchType: 'active'
      });
    },
  });
}

// Mutation para eliminar categoría
export function useDeleteCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al eliminar categoría');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ 
        queryKey: categoryKeys.lists(),
        refetchType: 'active'
      });
    },
  });
}


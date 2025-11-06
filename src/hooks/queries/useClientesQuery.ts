"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

// Query Keys
export const clienteKeys = {
  all: ['clientes'] as const,
  lists: () => [...clienteKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...clienteKeys.lists(), { companyId }] as const,
  details: () => [...clienteKeys.all, 'detail'] as const,
  detail: (id: string) => [...clienteKeys.details(), id] as const,
};

// Fetch clientes
async function fetchClientes(companyId: string): Promise<Cliente[]> {
  const response = await fetch(`/api/clients?companyId=${companyId}`);
  if (!response.ok) {
    throw new Error('Error al cargar clientes');
  }
  return response.json();
}

// Hook principal
export function useClientesQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: clienteKeys.list(companyId),
    queryFn: () => fetchClientes(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutos - los clientes cambian poco
  });
}

// Mutation para crear cliente
export function useCreateClienteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Error del servidor al crear cliente:', errorData);
        const errorMessage = errorData.message || errorData.error || 'Error al crear cliente';
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch inmediatamente para que los cambios se vean al instante
      queryClient.invalidateQueries({ 
        queryKey: clienteKeys.lists(),
        refetchType: 'active' // Solo refetch queries activas (visibles)
      });
    },
  });
}

// Mutation para actualizar cliente
export function useUpdateClienteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al actualizar cliente');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ 
        queryKey: clienteKeys.lists(),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: clienteKeys.detail(variables.id),
        refetchType: 'active'
      });
    },
  });
}

// Mutation para eliminar cliente
export function useDeleteClienteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al eliminar cliente');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch inmediatamente
      queryClient.invalidateQueries({ 
        queryKey: clienteKeys.lists(),
        refetchType: 'active'
      });
    },
  });
}


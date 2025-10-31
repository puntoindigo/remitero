"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Remito {
  id: string;
  number: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  status: {
    id: string;
    name: string;
    color: string;
  };
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Query Keys
export const remitoKeys = {
  all: ['remitos'] as const,
  lists: () => [...remitoKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...remitoKeys.lists(), { companyId }] as const,
  details: () => [...remitoKeys.all, 'detail'] as const,
  detail: (id: string) => [...remitoKeys.details(), id] as const,
};

// Fetch remitos
async function fetchRemitos(companyId: string, page?: number, pageSize?: number): Promise<{ items: Remito[]; total: number }> {
  const params = new URLSearchParams();
  params.set('companyId', companyId);
  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    params.set('limit', String(pageSize));
    params.set('offset', String(offset));
  }
  const response = await fetch(`/api/remitos?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Error al cargar remitos');
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    // Compatibilidad con respuestas antiguas
    return { items: data as Remito[], total: data.length };
  }
  return data as { items: Remito[]; total: number };
}

// Hook principal
export function useRemitosQuery(companyId: string | undefined, page?: number, pageSize?: number) {
  return useQuery({
    queryKey: [...remitoKeys.list(companyId), { page, pageSize }],
    queryFn: () => fetchRemitos(companyId!, page, pageSize),
    enabled: !!companyId, // Solo ejecutar si hay companyId
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Mutation para crear remito
export function useCreateRemitoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/remitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al crear remito');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch de todos los remitos
      queryClient.invalidateQueries({ queryKey: remitoKeys.lists() });
    },
  });
}

// Mutation para actualizar remito
export function useUpdateRemitoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/remitos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al actualizar remito');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidar remitos y el remito específico
      queryClient.invalidateQueries({ queryKey: remitoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: remitoKeys.detail(variables.id) });
    },
  });
}

// Mutation para eliminar remito
export function useDeleteRemitoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/remitos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al eliminar remito');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todos los remitos
      queryClient.invalidateQueries({ queryKey: remitoKeys.lists() });
    },
  });
}

// Mutation para cambiar estado
export function useUpdateRemitoStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ remitoId, statusId }: { remitoId: string; statusId: string }) => {
      const response = await fetch(`/api/remitos/${remitoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al cambiar estado');
      }
      
      return response.json();
    },
    // Optimistic update
    onMutate: async ({ remitoId, statusId }) => {
      // Cancelar refetch outgoing
      await queryClient.cancelQueries({ queryKey: remitoKeys.lists() });

      // Snapshot del estado anterior
      const previousRemitos = queryClient.getQueryData(remitoKeys.lists());

      // Actualizar optimistically
      queryClient.setQueriesData({ queryKey: remitoKeys.lists() }, (old: any) => {
        if (!old) return old;
        return old.map((remito: Remito) =>
          remito.id === remitoId
            ? { ...remito, status: { ...remito.status, id: statusId } }
            : remito
        );
      });

      return { previousRemitos };
    },
    onError: (err, variables, context) => {
      // Rollback en caso de error
      if (context?.previousRemitos) {
        queryClient.setQueriesData({ queryKey: remitoKeys.lists() }, context.previousRemitos);
      }
    },
    onSettled: () => {
      // Siempre refetch después de error o éxito
      queryClient.invalidateQueries({ queryKey: remitoKeys.lists() });
    },
  });
}


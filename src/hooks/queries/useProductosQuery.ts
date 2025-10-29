"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...productKeys.lists(), { companyId }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch productos
async function fetchProductos(companyId: string): Promise<Product[]> {
  const response = await fetch(`/api/products?companyId=${companyId}`);
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }
  const data = await response.json();
  // Filtrar productos válidos
  return (data || []).filter((product: any) => 
    product && product.id && product.name && product.name.trim() !== ''
  );
}

// Hook principal
export function useProductosQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: productKeys.list(companyId),
    queryFn: () => fetchProductos(companyId!),
    enabled: !!companyId,
    staleTime: 60 * 1000, // 1 minuto - los productos cambian menos
  });
}

// Mutation para crear producto
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al crear producto');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Mutation para actualizar producto
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al actualizar producto');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
}

// Mutation para eliminar producto
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'Error al eliminar producto');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}


"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERADOR';
  phone?: string;
  address?: string;
  company?: { id: string; name: string } | null;
  createdAt: string;
  is_active?: boolean;
  lastActivity?: {
    action: string;
    description: string;
    createdAt: string;
  } | null;
}

export const usuarioKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuarioKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...usuarioKeys.lists(), { companyId }] as const,
  details: () => [...usuarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuarioKeys.details(), id] as const,
};

async function fetchUsuarios(companyId?: string): Promise<Usuario[]> {
  const url = companyId ? `/api/users?companyId=${companyId}` : '/api/users';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al cargar usuarios');
  return response.json();
}

export function useUsuariosQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: usuarioKeys.list(companyId),
    queryFn: () => fetchUsuarios(companyId),
    enabled: true, // Siempre habilitado - la API maneja el filtrado por companyId
    staleTime: 2 * 60 * 1000,
  });
}



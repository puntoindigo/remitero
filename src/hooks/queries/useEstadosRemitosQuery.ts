"use client";

import { useQuery } from '@tanstack/react-query';

export interface EstadoRemito {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  is_default?: boolean;
}

export const estadoKeys = {
  all: ['estados-remitos'] as const,
  lists: () => [...estadoKeys.all, 'list'] as const,
  list: (companyId: string | undefined) => [...estadoKeys.lists(), { companyId }] as const,
};

async function fetchEstados(companyId: string): Promise<EstadoRemito[]> {
  const response = await fetch(`/api/estados-remitos?companyId=${companyId}`);
  if (!response.ok) {
    throw new Error('Error al cargar estados');
  }
  const data = await response.json();
  return (data || []).filter((e: any) => e?.is_active);
}

export function useEstadosRemitosQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: estadoKeys.list(companyId),
    queryFn: () => fetchEstados(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
}



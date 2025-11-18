"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || 'Error al cargar usuarios';
    throw new Error(errorMessage);
  }
  return response.json();
}

export function useUsuariosQuery(companyId: string | undefined, enabled: boolean = true) {
  const { data: session, status } = useSession();
  
  // Verificar permisos internamente usando la sesión
  // Solo permitir si el usuario tiene rol ADMIN o SUPERADMIN
  const userRole = session?.user?.role;
  const hasPermission = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
  const sessionReady = status !== 'loading' && session !== null && userRole !== undefined;
  
  // Verificar también si el usuario tiene contraseña temporal (no debería ejecutar queries)
  const hasTemporaryPassword = session?.user && (session.user as any).hasTemporaryPassword === true;
  
  // Solo ejecutar si:
  // 1. enabled es true (parámetro explícito)
  // 2. La sesión está lista (no está cargando, hay sesión y tiene role)
  // 3. El usuario tiene permisos (ADMIN o SUPERADMIN)
  // 4. El usuario NO tiene contraseña temporal (debe cambiarla primero)
  const shouldEnable = enabled && sessionReady && hasPermission && !hasTemporaryPassword;
  
  // Logging para debug
  if (!shouldEnable && enabled) {
    console.log('🚫 [useUsuariosQuery] Query deshabilitada:', {
      enabled,
      sessionReady,
      hasPermission,
      hasTemporaryPassword,
      userRole,
      reason: !sessionReady ? 'session not ready' : !hasPermission ? 'no permission' : hasTemporaryPassword ? 'temporary password' : 'unknown'
    });
  }
  
  return useQuery({
    queryKey: usuarioKeys.list(companyId),
    queryFn: () => fetchUsuarios(companyId),
    enabled: shouldEnable, // Solo ejecutar si tiene permisos y no tiene contraseña temporal
    staleTime: 2 * 60 * 1000,
    retry: false, // No reintentar si falla por permisos
  });
}



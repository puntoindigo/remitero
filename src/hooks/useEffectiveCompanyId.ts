"use client";

import { useCurrentUser } from "./useCurrentUser";
import { useImpersonation } from "./useImpersonation";
import { useState, useEffect } from "react";

/**
 * Hook que maneja el companyId efectivo considerando impersonation y selección de empresa
 * 
 * Lógica:
 * 1. Si es SUPERADMIN (con o sin impersonation): usa selectedCompanyId si está seleccionado
 * 2. Si no es SUPERADMIN: usa el companyId del usuario actual (impersonado o no)
 * 3. Si no hay companyId: retorna null
 */
export function useEffectiveCompanyId() {
  const currentUser = useCurrentUser();
  const { isCurrentlyImpersonating } = useImpersonation();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Para SUPERADMIN, permitir seleccionar empresa independientemente de impersonation
  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  
  // El companyId efectivo es:
  // - Para SUPERADMIN: selectedCompanyId si está seleccionado, sino null
  // - Para otros roles: companyId del usuario actual
  const effectiveCompanyId = isSuperAdmin 
    ? (selectedCompanyId || null)
    : currentUser?.companyId || null;

  // Log para debugging
  useEffect(() => {
    console.log('useEffectiveCompanyId:', {
      currentUser: currentUser?.name,
      role: currentUser?.role,
      isCurrentlyImpersonating,
      isSuperAdmin,
      selectedCompanyId,
      effectiveCompanyId,
      userCompanyId: currentUser?.companyId
    });
  }, [currentUser, isCurrentlyImpersonating, isSuperAdmin, selectedCompanyId, effectiveCompanyId]);

  return {
    effectiveCompanyId,
    selectedCompanyId,
    setSelectedCompanyId,
    isSuperAdmin,
    isCurrentlyImpersonating,
    needsCompanySelection: isSuperAdmin && !selectedCompanyId
  };
}

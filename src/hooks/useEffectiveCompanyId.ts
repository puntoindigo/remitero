"use client";

import { useCurrentUser } from "./useCurrentUser";
import { useImpersonation } from "./useImpersonation";
import { useState, useEffect } from "react";

/**
 * Hook que maneja el companyId efectivo considerando impersonation y selección de empresa
 * 
 * Lógica CORRECTA:
 * 1. Si estoy impersonando: uso el companyId del usuario impersonado (veo lo que él vería)
 * 2. Si soy SUPERADMIN y NO estoy impersonando: puedo seleccionar empresa
 * 3. Si no soy SUPERADMIN: uso mi companyId
 */
export function useEffectiveCompanyId() {
  const currentUser = useCurrentUser();
  const { isCurrentlyImpersonating } = useImpersonation();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  
  // El companyId efectivo es:
  // - Si estoy impersonando: companyId del usuario impersonado (sin importar si soy SUPERADMIN)
  // - Si soy SUPERADMIN y NO estoy impersonando: selectedCompanyId si está seleccionado
  // - Si no soy SUPERADMIN: companyId del usuario actual
  const effectiveCompanyId = isCurrentlyImpersonating
    ? currentUser?.companyId || null  // Cuando impersono, veo lo que vería el usuario impersonado
    : isSuperAdmin
      ? (selectedCompanyId || null)   // SUPERADMIN sin impersonation puede seleccionar empresa
      : currentUser?.companyId || null; // Usuario normal usa su companyId

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
    // Solo necesita seleccionar empresa si es SUPERADMIN y NO está impersonando
    needsCompanySelection: isSuperAdmin && !isCurrentlyImpersonating && !selectedCompanyId,
    // Solo muestra el selector si es SUPERADMIN y NO está impersonando
    shouldShowCompanySelector: isSuperAdmin && !isCurrentlyImpersonating
  };
}

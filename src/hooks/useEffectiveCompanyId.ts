"use client";

import { useCurrentUser } from "./useCurrentUser";
import { useState } from "react";

/**
 * Hook que maneja el companyId efectivo considerando impersonation y selección de empresa
 * 
 * Lógica CORRECTA:
 * 1. Si estoy impersonando (impersonating !== null): uso el companyId del usuario impersonado
 * 2. Si soy SUPERADMIN y NO estoy impersonando: puedo seleccionar empresa
 * 3. Si no soy SUPERADMIN: uso mi companyId
 */
export function useEffectiveCompanyId() {
  const currentUser = useCurrentUser();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const isImpersonating = currentUser?.impersonating !== null;
  
  // El companyId efectivo es:
  // - Si estoy impersonando: companyId del usuario impersonado
  // - Si soy SUPERADMIN y NO estoy impersonando: selectedCompanyId si está seleccionado
  // - Si no soy SUPERADMIN: companyId del usuario actual
  const effectiveCompanyId = isImpersonating
    ? currentUser?.companyId || null  // Cuando impersono, veo lo que vería el usuario impersonado
    : isSuperAdmin
      ? (selectedCompanyId || null)   // SUPERADMIN sin impersonation puede seleccionar empresa
      : currentUser?.companyId || null; // Usuario normal usa su companyId

  return {
    effectiveCompanyId,
    selectedCompanyId,
    setSelectedCompanyId,
    isSuperAdmin,
    isImpersonating,
    // Solo necesita seleccionar empresa si es SUPERADMIN y NO está impersonando
    needsCompanySelection: isSuperAdmin && !isImpersonating && !selectedCompanyId,
    // Solo muestra el selector si es SUPERADMIN y NO está impersonando
    shouldShowCompanySelector: isSuperAdmin && !isImpersonating
  };
}

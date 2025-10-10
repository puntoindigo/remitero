"use client";

import { useEffectiveCompanyId } from "./useEffectiveCompanyId";

/**
 * Hook genérico que proporciona el companyId efectivo y funciones de selección de empresa
 * para usar en páginas que manejan datos por empresa
 */
export function useDataWithCompany() {
  const {
    effectiveCompanyId,
    selectedCompanyId,
    setSelectedCompanyId,
    isSuperAdmin,
    isCurrentlyImpersonating,
    needsCompanySelection
  } = useEffectiveCompanyId();

  return {
    // El companyId que deben usar todos los hooks de datos
    companyId: effectiveCompanyId,
    
    // Para el FilterableSelect de empresas
    selectedCompanyId,
    setSelectedCompanyId,
    
    // Información del usuario
    isSuperAdmin,
    isCurrentlyImpersonating,
    
    // Para mostrar/ocultar el selector de empresas
    needsCompanySelection,
    
    // Para mostrar/ocultar el FilterableSelect
    shouldShowCompanySelector: isSuperAdmin
  };
}

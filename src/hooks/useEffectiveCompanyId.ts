"use client";

import { useCurrentUser } from "./useCurrentUser";
import { useState, useEffect } from "react";

/**
 * Hook que maneja el companyId efectivo considerando impersonation y selección de empresa
 * 
 * Lógica SIMPLIFICADA:
 * - Si estoy impersonando: uso el companyId del usuario impersonado
 * - Si soy SUPERADMIN sin impersonar: puedo seleccionar empresa
 * - Si no soy SUPERADMIN: uso mi companyId
 */
export function useEffectiveCompanyId() {
  const currentUser = useCurrentUser();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Cargar selección de empresa desde sessionStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        setSelectedCompanyId(savedCompanyId);
      }
    }
  }, []);

  // Guardar selección de empresa en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCompanyId) {
        sessionStorage.setItem('selectedCompanyId', selectedCompanyId);
      } else {
        sessionStorage.removeItem('selectedCompanyId');
      }
    }
  }, [selectedCompanyId]);

  const isImpersonating = currentUser?.impersonating !== null;
  
  // El companyId efectivo es:
  // - Si estoy impersonando: companyId del usuario impersonado
  // - Si soy SUPERADMIN sin impersonar: selectedCompanyId si está seleccionado
  // - Si no soy SUPERADMIN: companyId del usuario actual
  const effectiveCompanyId = isImpersonating
    ? currentUser?.companyId || null  // Cuando impersono, veo lo que vería el usuario impersonado
    : currentUser?.role === "SUPERADMIN"
      ? (selectedCompanyId || null)   // SUPERADMIN sin impersonation puede seleccionar empresa
      : currentUser?.companyId || null; // Usuario normal usa su companyId

  return {
    effectiveCompanyId,
    selectedCompanyId,
    setSelectedCompanyId,
    // Solo mostrar selector si companyId es null y es SUPERADMIN
    shouldShowCompanySelector: currentUser?.companyId === null && currentUser?.role === "SUPERADMIN"
  };
}

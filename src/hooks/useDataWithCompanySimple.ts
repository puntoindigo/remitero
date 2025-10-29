"use client";

import { useCurrentUserSimple } from "./useCurrentUserSimple";
import { useState, useEffect } from "react";

/**
 * Hook simplificado que proporciona el companyId efectivo sin dependencias circulares
 * Optimizado: carga la empresa guardada inmediatamente desde sessionStorage
 */
export function useDataWithCompanySimple() {
  const currentUser = useCurrentUserSimple();
  
  // Inicializar directamente desde sessionStorage para evitar delay
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('selectedCompanyId') || "";
    }
    return "";
  });
  
  const [isInitialized, setIsInitialized] = useState(true); // Ya inicializado si leímos sessionStorage

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

  // Calcular los datos sin early returns
  const getData = () => {
    // Verificar que currentUser esté disponible y que el hook esté inicializado
    if (!currentUser || !isInitialized) {
      return {
        companyId: null,
        selectedCompanyId: "",
        setSelectedCompanyId: () => {},
        shouldShowCompanySelector: false
      };
    }

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
      // El companyId que deben usar todos los hooks de datos
      companyId: effectiveCompanyId,
      
      // Para el FilterableSelect de empresas
      selectedCompanyId,
      setSelectedCompanyId,
      
      // Para mostrar/ocultar el FilterableSelect
      shouldShowCompanySelector: currentUser?.companyId === null && currentUser?.role === "SUPERADMIN"
    };
  };

  return getData();
}

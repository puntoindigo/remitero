"use client";

import { useCurrentUserSimple } from "./useCurrentUserSimple";
import { useDataWithCompanySimple } from "./useDataWithCompanySimple";
import { useEmpresas } from "./useEmpresas";
import { useState, useEffect } from "react";

/**
 * Hook optimizado que carga empresa y datos en paralelo para evitar carga en dos tiempos
 */
export function useOptimizedPageData() {
  const currentUser = useCurrentUserSimple();
  const { empresas, isLoading: empresasLoading } = useEmpresas();
  const { 
    companyId, 
    selectedCompanyId, 
    setSelectedCompanyId, 
    shouldShowCompanySelector 
  } = useDataWithCompanySimple();
  
  // Inicializar isPageReady optimistamente: si hay empresa guardada, listo desde el inicio
  const [isPageReady, setIsPageReady] = useState(() => {
    // Para SUPERADMIN: si hay una empresa guardada, asumir que estamos listos
    // Los datos se cargarán inmediatamente, las empresas cargan en background
    if (typeof window !== 'undefined') {
      const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        return true; // Tenemos empresa guardada, cargar datos inmediatamente
      }
    }
    return false; // Sin empresa guardada, esperar
  });

  useEffect(() => {
    // Solo marcar como listo cuando:
    // 1. El usuario esté cargado
    // 2. Si hay companyId guardado → listo inmediatamente (NUNCA esperar empresas)
    // 3. Si es SUPERADMIN sin companyId → esperar empresas para mostrar selector
    // 4. Si no es SUPERADMIN → listo inmediatamente (usa su companyId)
    
    // Verificar si hay empresa guardada ANTES de verificar currentUser
    const hasSavedCompany = typeof window !== 'undefined' && 
                           !!sessionStorage.getItem('selectedCompanyId');
    
    if (!currentUser) {
      // Si hay empresa guardada, mantener isPageReady como true (no resetear)
      // Si no hay empresa guardada, resetear a false
      if (!hasSavedCompany) {
        setIsPageReady(false);
      }
      return;
    }

    if (currentUser.role === "SUPERADMIN") {
      // Para SUPERADMIN: 
      // - Si hay companyId (de sessionStorage o seleccionado), listo INMEDIATAMENTE
      // - Las empresas cargan en background, NO bloqueamos la carga de datos
      // - Solo esperamos empresas si NO hay empresa guardada (para mostrar selector vacío)
      if (companyId || hasSavedCompany) {
        setIsPageReady(true); // Listo inmediatamente, empresas cargan en background
      } else {
        // Solo esperar empresas si NO hay empresa guardada (primera vez)
        setIsPageReady(!empresasLoading);
      }
    } else {
      // Para usuarios normales, solo esperar al usuario
      setIsPageReady(true);
    }
  }, [currentUser, empresasLoading, companyId]);

  // Determinar si necesita selección de empresa
  const needsCompanySelection = shouldShowCompanySelector && (!selectedCompanyId || selectedCompanyId === "");

  return {
    // Datos del usuario
    currentUser,
    
    // Datos de empresa
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector,
    empresas,
    
    // Estados de carga
    isPageReady,
    isLoading: !isPageReady,
    empresasLoading,
    
    // Estados de UI
    needsCompanySelection,
    
    // Helper para mostrar contenido
    canShowContent: isPageReady && !needsCompanySelection
  };
}

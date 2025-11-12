"use client";

import React from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageLoading } from "@/components/common/PageLoading";
import { useOptimizedPageData } from "@/hooks/useOptimizedPageData";
import FilterableSelect from "@/components/common/FilterableSelect";

interface OptimizedPageLayoutProps {
  children: React.ReactNode;
  title: string;
  emptyStateIcon?: React.ReactNode;
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

/**
 * Layout optimizado que maneja la carga en paralelo y evita carga en dos tiempos
 */
export function OptimizedPageLayout({
  children,
  title,
  emptyStateIcon,
  emptyStateMessage = "Selecciona una empresa para continuar",
  emptyStateSubMessage = "Usa el selector de arriba para elegir una empresa."
}: OptimizedPageLayoutProps) {
  const {
    currentUser,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector,
    empresas,
    isLoading,
    needsCompanySelection,
    canShowContent
  } = useOptimizedPageData();

  // Prevenir errores de client-side exception
  if (!currentUser) {
    return <PageLoading message="Cargando usuario..." />;
  }

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return <PageLoading message="Cargando datos..." />;
  }

  return (
    <main className="main-content">
      <div className="form-section">
        <h2 className="gestion-header" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>{title}</h2>

        {/* Selector de empresa - ancho completo */}
        {shouldShowCompanySelector && empresas?.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <FilterableSelect
              options={empresas}
              value={selectedCompanyId}
              onChange={setSelectedCompanyId}
              placeholder="Seleccionar empresa"
              searchFields={["name"]}
              className="w-full"
              useThemeColors={true}
            />
          </div>
        )}

        {/* Contenido principal */}
        {needsCompanySelection ? (
          <div className="empty-state">
            {emptyStateIcon}
            <p>{emptyStateMessage}</p>
            <p className="text-sm text-gray-500 mt-2">{emptyStateSubMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}

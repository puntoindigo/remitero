"use client";

import { useState, useEffect } from "react";
import FilterableSelect from "./FilterableSelect";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";

interface CompanySelectorProps {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  storageKey?: string; // Clave para sessionStorage (opcional, por defecto 'selectedCompanyId')
}

export function CompanySelector({ 
  selectedCompanyId, 
  setSelectedCompanyId,
  storageKey = 'selectedCompanyId'
}: CompanySelectorProps) {
  const currentUser = useCurrentUserSimple();
  const { empresas } = useEmpresas();

  // Cargar selección de empresa desde sessionStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = sessionStorage.getItem(storageKey);
      if (savedCompanyId !== null && savedCompanyId !== selectedCompanyId) {
        setSelectedCompanyId(savedCompanyId);
      }
    }
  }, [storageKey]); // Solo ejecutar una vez al montar

  // Guardar selección de empresa en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCompanyId) {
        sessionStorage.setItem(storageKey, selectedCompanyId);
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [selectedCompanyId, storageKey]);

  // Solo mostrar si es SUPERADMIN y hay empresas
  if (currentUser?.role !== "SUPERADMIN" || !empresas || empresas.length === 0) {
    return null;
  }

  return (
    <div style={{ width: 'fit-content', flexShrink: 0 }}>
      <FilterableSelect
        options={[
          { id: "", name: "Todas las empresas" },
          ...empresas
        ]}
        value={selectedCompanyId}
        onChange={setSelectedCompanyId}
        placeholder="Seleccionar empresa"
        className=""
        useThemeColors={true}
        style={{ width: 'fit-content', minWidth: '150px', maxWidth: '250px' }}
      />
    </div>
  );
}


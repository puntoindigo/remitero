"use client";

import FilterableSelect from "./FilterableSelect";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";

interface CompanySelectorProps {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
}

export function CompanySelector({ 
  selectedCompanyId, 
  setSelectedCompanyId
}: CompanySelectorProps) {
  const currentUser = useCurrentUserSimple();
  const { empresas } = useEmpresas();

  // Nota: La persistencia en sessionStorage se maneja en useDataWithCompanySimple
  // No duplicar la lógica aquí para evitar conflictos

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
        style={{ width: 'fit-content', minWidth: '200px', maxWidth: '400px' }}
      />
    </div>
  );
}


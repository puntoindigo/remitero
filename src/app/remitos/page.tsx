"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, FileText } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { useEmpresas } from "@/hooks/useEmpresas";
import FilterableSelect from "@/components/common/FilterableSelect";

interface Remito {
  id: string;
  number: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  status: {
    id: string;
    name: string;
    color: string;
  };
  total: number;
  createdAt: string;
  updatedAt: string;
}

function RemitosContentSimple() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { empresas } = useEmpresas();

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/remitos?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setRemitos(data || []);
      }
    } catch (error) {
      console.error('Error loading remitos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  if (!session) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <main className="main-content">
      <div className="page-container">
        <div className="page-header">
          <h1>Gestión de Remitos</h1>
          <h2>Administra los remitos de la empresa</h2>
        </div>

        {/* Filtros adicionales */}
        <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          {shouldShowCompanySelector && empresas.length > 0 && (
            <FilterableSelect
              options={empresas}
              value={selectedCompanyId}
              onChange={setSelectedCompanyId}
              placeholder="Seleccionar empresa"
              searchFields={["name"]}
              className="w-64"
            />
          )}
        </div>

        {/* Contenido principal */}
        {needsCompanySelection ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <h3>Selecciona una empresa</h3>
            <p>Para ver los remitos, primero selecciona una empresa.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <div className="data-table-header">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar remitos..."
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Remito
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading">Cargando remitos...</div>
            ) : remitos.length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" />
                <h3>No hay remitos</h3>
                <p>Comienza creando un nuevo remito.</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remitos.map((remito) => (
                      <tr key={remito.id}>
                        <td>{remito.number}</td>
                        <td>{new Date(remito.createdAt).toLocaleDateString('es-AR')}</td>
                        <td>{remito.client.name}</td>
                        <td>{remito.client.email || 'Sin email'}</td>
                        <td>
                          <span 
                            className="badge"
                            style={{ backgroundColor: remito.status.color + '20', color: remito.status.color }}
                          >
                            {remito.status.name}
                          </span>
                        </td>
                        <td>${remito.total.toFixed(2)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-button edit-button" title="Editar">
                              ✏️
                            </button>
                            <button className="action-button delete-button" title="Eliminar">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function RemitosPageSimple() {
  return (
    <RemitosContentSimple />
  );
}
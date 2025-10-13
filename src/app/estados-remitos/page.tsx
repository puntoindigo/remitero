"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { useEmpresas } from "@/hooks/useEmpresas";
import FilterableSelect from "@/components/common/FilterableSelect";

interface EstadoRemito {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  is_default: boolean;
  createdAt: string;
}

function EstadosRemitosContentSimple() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  const [estados, setEstados] = useState<EstadoRemito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { empresas } = useEmpresas();

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/estados-remitos?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setEstados(data || []);
      }
    } catch (error) {
      console.error('Error loading estados:', error);
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
          <h1>Gestión de Estados de Remitos</h1>
          <h2>Administra los estados de los remitos</h2>
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
            <Tag className="empty-icon" />
            <h3>Selecciona una empresa</h3>
            <p>Para ver los estados, primero selecciona una empresa.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <div className="data-table-header">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar estados..."
                  className="search-input"
                />
              </div>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Estado
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading">Cargando estados...</div>
            ) : estados.length === 0 ? (
              <div className="empty-state">
                <Tag className="empty-icon" />
                <h3>No hay estados</h3>
                <p>Comienza creando un nuevo estado.</p>
              </div>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Color</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estados.map((estado) => (
                      <tr key={estado.id}>
                        <td>{estado.name}</td>
                        <td>{estado.description || 'Sin descripción'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div 
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: estado.color,
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              {estado.color}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${estado.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {estado.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-button edit-button" 
                              title="Editar"
                              onClick={() => console.log('Editar estado:', estado.id)}
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-button delete-button" 
                              title="Eliminar"
                              onClick={() => console.log('Eliminar estado:', estado.id)}
                            >
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

export default function EstadosRemitosPageSimple() {
  return (
    <EstadosRemitosContentSimple />
  );
}

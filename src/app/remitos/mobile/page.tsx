"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Calendar, User, Package, Search, Filter, Eye, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useRemitosQuery, type Remito } from "@/hooks/queries/useRemitosQuery";
import { useEstadosRemitosQuery } from "@/hooks/queries/useEstadosRemitosQuery";
import FilterableSelect from "@/components/common/FilterableSelect";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import Link from "next/link";

export default function MobileRemitosPage() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data: remitosPage, isLoading } = useRemitosQuery(companyId || undefined, page, pageSize);
  const remitos = (remitosPage?.items as any) || [];
  const totalRemitos = remitosPage?.total || 0;
  
  const { data: estadosActivos = [] } = useEstadosRemitosQuery(companyId || undefined);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Inicializar filtro desde URL
  useEffect(() => {
    const urlStatus = searchParams?.get('status');
    if (urlStatus) {
      // Buscar el estado por nombre o slug
      const estado = estadosActivos.find((e: any) => 
        e.name?.toUpperCase().replace(/\s+/g, '_') === urlStatus.toUpperCase() ||
        e.id === urlStatus
      );
      if (estado) {
        setSelectedStatusFilter(estado.id);
      }
    }
  }, [searchParams, estadosActivos]);
  
  // Filtrar remitos
  const filteredRemitos = React.useMemo(() => {
    let filtered = remitos;
    
    // Filtro por estado
    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter((r: Remito) => r.status === selectedStatusFilter);
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r: Remito) => 
        r.number?.toString().toLowerCase().includes(term) ||
        r.client?.name?.toLowerCase().includes(term) ||
        r.client?.email?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [remitos, selectedStatusFilter, searchTerm]);
  
  // Calcular total del remito
  const getRemitoTotal = (remito: Remito) => {
    const items = remito.remitoItems || remito.items || [];
    return items.reduce((sum: number, item: any) => {
      return sum + (item.lineTotal || (item.quantity || 0) * (item.unitPrice || 0));
    }, 0);
  };
  
  // Obtener nombre del estado
  const getEstadoName = (statusId: string) => {
    const estado = estadosActivos.find((e: any) => e.id === statusId);
    return estado?.name || "Desconocido";
  };
  
  // Obtener color del estado
  const getEstadoColor = (statusId: string) => {
    const estado = estadosActivos.find((e: any) => e.id === statusId);
    return estado?.color || "#6b7280";
  };
  
  if (!currentUser) {
    return (
      <MobileLayout>
        <LoadingSpinner message="Cargando usuario..." />
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#111827',
            marginBottom: '0.75rem'
          }}>
            Remitos
          </h1>
          
          {/* Selector de empresa (solo SUPERADMIN) */}
          {shouldShowCompanySelector && (
            <div style={{ marginBottom: '0.75rem' }}>
              <FilterableSelect
                options={[]}
                value={selectedCompanyId || ""}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                className="w-full"
                useThemeColors={true}
              />
            </div>
          )}
          
          {/* Búsqueda y filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              flex: 1, 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  color: '#6b7280',
                  pointerEvents: 'none'
                }} 
              />
              <input
                type="text"
                placeholder="Buscar remitos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: showFilters ? '#3b82f6' : '#fff',
                color: showFilters ? '#fff' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Filter size={18} />
            </button>
          </div>
          
          {/* Panel de filtros */}
          {showFilters && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Estado:
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff',
                }}
              >
                <option value="all">Todos los estados</option>
                {estadosActivos.map((estado: any) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Contador */}
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
            marginBottom: '0.75rem'
          }}>
            {filteredRemitos.length} de {totalRemitos} remitos
          </div>
        </div>
        
        {/* Lista de remitos */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner message="Cargando remitos..." />
          </div>
        ) : filteredRemitos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: '#6b7280'
          }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No hay remitos
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || selectedStatusFilter !== "all" 
                ? "Intenta ajustar los filtros" 
                : "Comienza creando un nuevo remito"}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredRemitos.map((remito: Remito) => {
              const total = getRemitoTotal(remito);
              const estadoName = getEstadoName(remito.status || "");
              const estadoColor = getEstadoColor(remito.status || "");
              
              return (
                <Link
                  key={remito.id}
                  href={`/remitos/${remito.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    textDecoration: 'none',
                    color: '#111827',
                    display: 'block',
                  }}
                >
                  {/* Header del card */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <FileText size={18} color="#3b82f6" />
                        <span style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: 600,
                          color: '#111827'
                        }}>
                          #{remito.number}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: estadoColor + '20',
                        color: estadoColor,
                        marginTop: '0.25rem'
                      }}>
                        {estadoName}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  {/* Información del cliente */}
                  {remito.client && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <User size={16} />
                      <span>{remito.client.name || 'Sin cliente'}</span>
                    </div>
                  )}
                  
                  {/* Fecha */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    <Calendar size={16} />
                    <span>{formatDate(remito.createdAt)}</span>
                  </div>
                  
                  {/* Items count */}
                  {(remito.remitoItems || remito.items) && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <Package size={16} />
                      <span>
                        {(remito.remitoItems || remito.items || []).length} 
                        {(remito.remitoItems || remito.items || []).length === 1 ? ' producto' : ' productos'}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Paginación simple */}
        {!isLoading && totalRemitos > pageSize && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            marginTop: '1.5rem',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: page === 1 ? '#f3f4f6' : '#fff',
                color: page === 1 ? '#9ca3af' : '#374151',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Anterior
            </button>
            <span style={{ 
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center'
            }}>
              Página {page} de {Math.ceil(totalRemitos / pageSize)}
            </span>
            <button
              onClick={() => setPage(Math.min(Math.ceil(totalRemitos / pageSize), page + 1))}
              disabled={page >= Math.ceil(totalRemitos / pageSize)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: page >= Math.ceil(totalRemitos / pageSize) ? '#f3f4f6' : '#fff',
                color: page >= Math.ceil(totalRemitos / pageSize) ? '#9ca3af' : '#374151',
                cursor: page >= Math.ceil(totalRemitos / pageSize) ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}


"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUserSimple } from "./useCurrentUserSimple";

export interface EstadoRemito {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  company_id: string;
  companies?: {
    id: string;
    name: string;
  };
}

export interface EstadoRemitoFormData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active?: boolean;
  sort_order?: number;
}

// Estados predefinidos como fallback
const ESTADOS_PREDEFINIDOS: EstadoRemito[] = [
  {
    id: 'pendiente',
    name: 'Pendiente',
    description: 'Remito creado, esperando procesamiento',
    color: '#f59e0b',
    icon: '⏰',
    is_active: true,
    is_default: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: ''
  },
  {
    id: 'preparado',
    name: 'Preparado',
    description: 'Remito preparado para entrega',
    color: '#10b981',
    icon: '✅',
    is_active: true,
    is_default: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: ''
  },
  {
    id: 'entregado',
    name: 'Entregado',
    description: 'Remito entregado al cliente',
    color: '#3b82f6',
    icon: '🚚',
    is_active: true,
    is_default: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: ''
  },
  {
    id: 'cancelado',
    name: 'Cancelado',
    description: 'Remito cancelado',
    color: '#ef4444',
    icon: '❌',
    is_active: true,
    is_default: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: ''
  }
];

export function useEstadosRemitos(companyId?: string) {
  const currentUser = useCurrentUserSimple();
  const [estados, setEstados] = useState<EstadoRemito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEstados = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!companyId) {
        setEstados(ESTADOS_PREDEFINIDOS);
        setIsLoading(false);
        return;
      }

      // Pasar companyId del usuario actual (considerando impersonation)
      const url = companyId ? `/api/estados-remitos?companyId=${companyId}` : "/api/estados-remitos";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error al cargar estados de remitos");
      }
      
      const data = await response.json();
      
      // Si no hay estados, crear los básicos automáticamente
      if (!data || data.length === 0) {
        console.log('🔧 No hay estados, creando estados básicos automáticamente...');
        await createBasicEstados();
        // Recargar estados después de crearlos
        const newResponse = await fetch(url);
        if (newResponse.ok) {
          const newData = await newResponse.json();
          setEstados(newData || []);
        } else {
          setEstados(ESTADOS_PREDEFINIDOS);
        }
      } else {
        setEstados(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estados");
      console.error("Error loading estados:", err);
      // En caso de error, usar estados predefinidos
      setEstados(ESTADOS_PREDEFINIDOS);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // Función para crear estados básicos automáticamente
  const createBasicEstados = useCallback(async () => {
    if (!companyId) return;
    
    const basicEstados = [
      { name: 'Pendiente', description: 'Remito creado, esperando procesamiento', color: '#f59e0b', icon: '⏰' },
      { name: 'En Proceso', description: 'Remito siendo procesado', color: '#3b82f6', icon: '🔄' },
      { name: 'Completado', description: 'Remito completado exitosamente', color: '#10b981', icon: '✅' },
      { name: 'Cancelado', description: 'Remito cancelado', color: '#ef4444', icon: '❌' }
    ];

    try {
      for (const estado of basicEstados) {
        await fetch("/api/estados-remitos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...estado,
            companyId: companyId
          })
        });
      }
      console.log('✅ Estados básicos creados automáticamente');
    } catch (error) {
      console.error('❌ Error creando estados básicos:', error);
    }
  }, [companyId]);

  useEffect(() => {
    loadEstados();
  }, [loadEstados]);

  const createEstado = async (estadoData: EstadoRemitoFormData) => {
    try {
      console.log('🔵 [CREATE ESTADO] Iniciando creación:', estadoData);
      console.log('🔵 [CREATE ESTADO] CompanyId del parámetro:', companyId);
      console.log('🔵 [CREATE ESTADO] CompanyId del usuario:', currentUser?.companyId);
      
      // Usar el companyId del parámetro (para SUPERADMIN con selector)
      // o el del usuario actual (para ADMIN/USER)
      const effectiveCompanyId = companyId || currentUser?.companyId;
      
      const payload = {
        ...estadoData,
        companyId: effectiveCompanyId
      };
      
      console.log('🔵 [CREATE ESTADO] CompanyId efectivo:', effectiveCompanyId);
      console.log('🔵 [CREATE ESTADO] Payload completo:', payload);
      
      const response = await fetch("/api/estados-remitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log('🔵 [CREATE ESTADO] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [CREATE ESTADO] Error response:', errorData);
        throw new Error(errorData.message || "Error al crear estado");
      }

      const newEstado = await response.json();
      console.log('✅ [CREATE ESTADO] Estado creado exitosamente:', newEstado);
      setEstados(prev => [...prev, newEstado]);
      return newEstado;
    } catch (err) {
      console.error('❌ [CREATE ESTADO] Exception:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al crear estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEstado = async (id: string, estadoData: EstadoRemitoFormData) => {
    try {
      console.log('🟡 [UPDATE ESTADO] Actualizando estado:', id, estadoData);
      
      // Usar el companyId del parámetro (para SUPERADMIN con selector)
      // o el del usuario actual (para ADMIN/USER)
      const effectiveCompanyId = companyId || currentUser?.companyId;
      console.log('🟡 [UPDATE ESTADO] CompanyId efectivo:', effectiveCompanyId);
      
      const response = await fetch(`/api/estados-remitos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...estadoData,
          companyId: effectiveCompanyId
        })
      });

      console.log('🟡 [UPDATE ESTADO] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [UPDATE ESTADO] Error response:', errorData);
        throw new Error(errorData.message || "Error al actualizar estado");
      }

      const updatedEstado = await response.json();
      console.log('✅ [UPDATE ESTADO] Estado actualizado exitosamente:', updatedEstado);
      setEstados(prev => prev.map(estado => 
        estado?.id === id ? updatedEstado : estado
      ));
      return updatedEstado;
    } catch (err) {
      console.error('❌ [UPDATE ESTADO] Exception:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEstado = async (id: string) => {
    try {
      console.log('🔴 [DELETE ESTADO] Eliminando estado:', id);
      
      const response = await fetch(`/api/estados-remitos/${id}`, {
        method: "DELETE",
      });

      console.log('🔴 [DELETE ESTADO] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [DELETE ESTADO] Error response:', errorData);
        throw new Error(errorData.message || "Error al eliminar estado");
      }

      console.log('✅ [DELETE ESTADO] Estado eliminado exitosamente');
      setEstados(prev => prev.filter(estado => estado?.id !== id));
    } catch (err) {
      console.error('❌ [DELETE ESTADO] Exception:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getEstadoById = (id: string) => {
    return estados.find(estado => estado?.id === id);
  };

  const estadosActivos = useMemo(() => {
    return estados.filter(estado => estado.is_active);
  }, [estados]);

  return {
    estados,
    estadosActivos,
    isLoading,
    error,
    getEstadoById,
    loadEstados,
    createEstado,
    updateEstado,
    deleteEstado
  };
}

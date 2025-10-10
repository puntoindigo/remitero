"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";

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
  const currentUser = useCurrentUser();
  const [estados, setEstados] = useState<EstadoRemito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEstados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!companyId) {
        setEstados(ESTADOS_PREDEFINIDOS);
        return;
      }

      // Pasar companyId del usuario actual (considerando impersonation)
      const url = companyId ? `/api/estados-remitos?companyId=${companyId}` : "/api/estados-remitos";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error al cargar estados de remitos");
      }
      
      const data = await response.json();
      setEstados(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estados");
      console.error("Error loading estados:", err);
      // En caso de error, usar estados predefinidos
      setEstados(ESTADOS_PREDEFINIDOS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstados();
  }, [companyId]);

  const createEstado = async (estadoData: EstadoRemitoFormData) => {
    try {
      const response = await fetch("/api/estados-remitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...estadoData,
          companyId: currentUser?.companyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear estado");
      }

      const newEstado = await response.json();
      setEstados(prev => [...prev, newEstado]);
      return newEstado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEstado = async (id: string, estadoData: EstadoRemitoFormData) => {
    try {
      const response = await fetch(`/api/estados-remitos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...estadoData,
          companyId: currentUser?.companyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar estado");
      }

      const updatedEstado = await response.json();
      setEstados(prev => prev.map(estado => 
        estado.id === id ? updatedEstado : estado
      ));
      return updatedEstado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEstado = async (id: string) => {
    try {
      const response = await fetch(`/api/estados-remitos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar estado");
      }

      setEstados(prev => prev.filter(estado => estado.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar estado";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getEstadoById = (id: string) => {
    return estados.find(estado => estado.id === id);
  };

  const getEstadosActivos = () => {
    return estados.filter(estado => estado.is_active);
  };

  return {
    estados,
    estadosActivos: getEstadosActivos(),
    isLoading,
    error,
    getEstadoById,
    loadEstados,
    createEstado,
    updateEstado,
    deleteEstado
  };
}

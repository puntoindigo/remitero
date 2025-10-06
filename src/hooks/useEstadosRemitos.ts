"use client";

import { useState, useEffect } from "react";

export interface EstadoRemito {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

// Estados predefinidos como fallback
const ESTADOS_PREDEFINIDOS: EstadoRemito[] = [
  {
    id: 'pendiente',
    name: 'Pendiente',
    description: 'Remito creado, esperando procesamiento',
    color: '#f59e0b',
    icon: '⏰',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'preparado',
    name: 'Preparado',
    description: 'Remito preparado para entrega',
    color: '#10b981',
    icon: '✅',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'entregado',
    name: 'Entregado',
    description: 'Remito entregado al cliente',
    color: '#3b82f6',
    icon: '🚚',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cancelado',
    name: 'Cancelado',
    description: 'Remito cancelado',
    color: '#ef4444',
    icon: '❌',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export function useEstadosRemitos() {
  const [estados, setEstados] = useState<EstadoRemito[]>(ESTADOS_PREDEFINIDOS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEstados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por ahora usamos los estados predefinidos
      // En el futuro esto vendrá de una API
      setEstados(ESTADOS_PREDEFINIDOS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar estados");
      console.error("Error loading estados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstados();
  }, []);

  const getEstadoById = (id: string) => {
    return estados.find(estado => estado.id === id);
  };

  const getEstadosActivos = () => {
    return estados.filter(estado => estado.isActive);
  };

  return {
    estados,
    estadosActivos: getEstadosActivos(),
    isLoading,
    error,
    getEstadoById,
    loadEstados
  };
}

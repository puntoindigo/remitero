"use client";

import { useState, useEffect } from "react";

export interface EstadoSimple {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
}

export function useEstadosByCompany(companyId?: string) {
  const [estados, setEstados] = useState<EstadoSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEstados = async () => {
    if (!companyId) {
      setEstados([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/estados-remitos?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar estados");
      }
      
      const data = await response.json();
      // Filtrar solo estados activos
      const estadosActivos = (data || []).filter((estado: any) => estado.is_active);
      setEstados(estadosActivos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading estados:", err);
      setEstados([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstados();
  }, [companyId]);

  return {
    estados,
    isLoading,
    error,
    reload: loadEstados
  };
}

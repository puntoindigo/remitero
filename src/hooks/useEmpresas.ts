"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface Empresa {
  id: string;
  name: string;
  createdAt: Date;
  users?: { id: string }[];
}

export function useEmpresas() {
  const { data: session } = useSession();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar que la sesión esté disponible
  if (!session) {
    return {
      empresas: [],
      isLoading: true,
      error: null,
      createEmpresa: async () => {},
      updateEmpresa: async () => {},
      deleteEmpresa: async () => {}
    };
  }

  const loadEmpresas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/companies");
      
      if (!response.ok) {
        throw new Error(`Error al cargar empresas: ${response.status}`);
      }
      
      const data = await response.json();
      setEmpresas(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmpresa = async (name: string) => {
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear empresa");
      }

      const newEmpresa = await response.json();
      setEmpresas(prev => [...prev, newEmpresa]);
      return newEmpresa;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear empresa";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEmpresa = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar empresa");
      }

      const updatedEmpresa = await response.json();
      setEmpresas(prev => 
        prev.map(empresa => 
          empresa.id === id ? updatedEmpresa : empresa
        )
      );
      return updatedEmpresa;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar empresa";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEmpresa = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar empresa");
      }

      setEmpresas(prev => prev.filter(empresa => empresa.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar empresa";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    
    if (session.user?.role === "SUPERADMIN") {
      loadEmpresas();
    } else if (session.user) {
      setIsLoading(false);
    }
  }, [session, loadEmpresas]);

  return {
    empresas,
    isLoading,
    error,
    loadEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
  };
}

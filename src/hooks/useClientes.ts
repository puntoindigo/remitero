"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUserSimple } from "./useCurrentUserSimple";

export interface Cliente {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface ClienteFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export function useClientes(companyId?: string) {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determinar el companyId efectivo para las operaciones CRUD
  const getEffectiveCompanyId = () => {
    // Si se pasa companyId como parámetro (desde useDataWithCompany), usarlo
    if (companyId) {
      return companyId;
    }
    
    // Si no hay companyId pasado, usar la lógica del usuario actual
    const isImpersonating = currentUser?.impersonating !== null;
    
    if (isImpersonating) {
      // Cuando impersono, uso el companyId del usuario impersonado
      return currentUser?.companyId || null;
    } else if (currentUser?.role === "SUPERADMIN") {
      // SUPERADMIN sin impersonation: si no hay companyId seleccionado, no puede crear
      return null;
    } else {
      // Usuario normal usa su companyId
      return currentUser?.companyId || null;
    }
  };

  const createCliente = async (clienteData: ClienteFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede crear el cliente: CompanyId no disponible");
      }

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clienteData,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear cliente");
      }

      const newCliente = await response.json();
      setClientes(prev => [newCliente, ...prev]);
      return newCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCliente = async (id: string, clienteData: ClienteFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede actualizar el cliente: CompanyId no disponible");
      }

      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clienteData,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar cliente");
      }

      const updatedCliente = await response.json();
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id ? updatedCliente : cliente
        )
      );
      return updatedCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar cliente");
      }

      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loadClientes = useCallback(async () => {
    const effectiveCompanyId = getEffectiveCompanyId();
    
    if (!effectiveCompanyId) {
      setClientes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/clients?companyId=${effectiveCompanyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar clientes");
      }
      
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading clientes:", err);
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, currentUser?.id, currentUser?.role, currentUser?.companyId, currentUser?.impersonating]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    isLoading,
    error,
    loadClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}

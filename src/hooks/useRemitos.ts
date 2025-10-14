"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUserSimple } from "./useCurrentUserSimple";

export interface RemitoItem {
  product_id?: string;
  product_name: string;
  product_desc?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Remito {
  id: string;
  number: number;
  status: "PENDIENTE" | "PREPARADO" | "ENTREGADO" | "CANCELADO";
  status_at: string;
  notes?: string;
  total: number;
  clientId: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  remitoItems: RemitoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RemitoFormData {
  clientId: string;
  notes?: string;
  items: RemitoItem[];
}

export function useRemitos(companyId?: string) {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const [remitos, setRemitos] = useState<Remito[]>([]);
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

  const loadRemitos = async () => {
    const effectiveCompanyId = getEffectiveCompanyId();
    
    if (!effectiveCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/remitos?companyId=${effectiveCompanyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar remitos");
      }
      
      const data = await response.json();
      setRemitos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading remitos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRemito = async (remitoData: RemitoFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede crear el remito: CompanyId no disponible");
      }

      const response = await fetch("/api/remitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...remitoData,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear remito");
      }

      const newRemito = await response.json();
      setRemitos(prev => [...prev, newRemito]);
      return newRemito;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear remito";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateRemito = async (id: string, remitoData: RemitoFormData) => {
    try {
      const response = await fetch(`/api/remitos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remitoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar remito");
      }

      const updatedRemito = await response.json();
      setRemitos(prev => 
        prev.map(remito => 
          remito.id === id ? updatedRemito : remito
        )
      );
      return updatedRemito;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar remito";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateRemitoStatus = async (id: string, status: Remito["status"]) => {
    try {
      const response = await fetch(`/api/remitos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar estado del remito");
      }

      const updatedRemito = await response.json();
      setRemitos(prev => 
        prev.map(remito => 
          remito.id === id ? updatedRemito : remito
        )
      );
      return updatedRemito;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar estado del remito";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteRemito = async (id: string) => {
    try {
      const response = await fetch(`/api/remitos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar remito");
      }

      setRemitos(prev => prev.filter(remito => remito.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar remito";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getRemitoById = async (id: string): Promise<Remito | null> => {
    try {
      const response = await fetch(`/api/remitos/${id}`);
      if (!response.ok) {
        throw new Error("Error al cargar remito");
      }
      return await response.json();
    } catch (err) {
      console.error("Error loading remito:", err);
      return null;
    }
  };

  useEffect(() => {
    loadRemitos();
  }, [currentUser?.companyId]);

  return {
    remitos,
    isLoading,
    error,
    loadRemitos,
    createRemito,
    updateRemito,
    updateRemitoStatus,
    deleteRemito,
    getRemitoById,
  };
}

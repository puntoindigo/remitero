"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "./useCurrentUser";

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

export function useRemitos() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRemitos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Pasar companyId del usuario actual (considerando impersonation)
      const url = currentUser?.companyId ? `/api/remitos?companyId=${currentUser.companyId}` : "/api/remitos";
      console.log('🔍 useRemitos - currentUser:', currentUser);
      console.log('🔍 useRemitos - URL:', url);
      const response = await fetch(url);
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
      const response = await fetch("/api/remitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remitoData),
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

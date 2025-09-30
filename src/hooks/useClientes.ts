"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

export function useClientes() {
  const { data: session } = useSession();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Error al cargar clientes");
      }
      
      const data = await response.json();
      setClientes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading clientes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCliente = async (clienteData: ClienteFormData) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear cliente");
      }

      const newCliente = await response.json();
      setClientes(prev => [...prev, newCliente]);
      return newCliente;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCliente = async (id: string, clienteData: ClienteFormData) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clienteData),
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

  useEffect(() => {
    loadClientes();
  }, [session]);

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

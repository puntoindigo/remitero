"use client";

import { useState, useEffect, useCallback } from "react";
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

  const loadEmpresas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      try {
        response = await fetch("/api/companies");
      } catch (networkError) {
        // Manejar errores de red (pueden ser Events)
        console.error('Network error:', networkError);
        const errorMessage = networkError instanceof Error 
          ? networkError.message 
          : networkError instanceof Event
          ? "Error de conexión de red"
          : "Error desconocido al conectar con el servidor";
        setError(errorMessage);
        setEmpresas([]);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(`Error al cargar empresas: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json().catch(error => {
        console.error('Error parsing JSON:', error);
        throw new Error("Error al procesar respuesta del servidor");
      });
      
      setEmpresas(data || []);
    } catch (err) {
      // Manejar cualquier tipo de error (Error, Event, etc.)
      let errorMessage = "Error desconocido al cargar empresas";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err instanceof Event) {
        errorMessage = `Error de red: ${err.type}`;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Error loading empresas:', err);
      setError(errorMessage);
      setEmpresas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEmpresa = async (name: string) => {
    try {
      let response;
      try {
        response = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (networkError) {
        const errorMessage = networkError instanceof Error 
          ? networkError.message 
          : networkError instanceof Event
          ? "Error de conexión de red"
          : "Error desconocido al conectar con el servidor";
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al crear empresa: ${response.status}`);
      }

      const newEmpresa = await response.json().catch(error => {
        console.error('Error parsing JSON:', error);
        throw new Error("Error al procesar respuesta del servidor");
      });
      
      setEmpresas(prev => [...prev, newEmpresa]);
      return newEmpresa;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : err instanceof Event
        ? "Error de conexión de red"
        : "Error al crear empresa";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEmpresa = async (id: string, name: string) => {
    try {
      let response;
      try {
        response = await fetch(`/api/companies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name })
        });
      } catch (networkError) {
        const errorMessage = networkError instanceof Error 
          ? networkError.message 
          : networkError instanceof Event
          ? "Error de conexión de red"
          : "Error desconocido al conectar con el servidor";
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al actualizar empresa: ${response.status}`);
      }

      const updatedEmpresa = await response.json().catch(error => {
        console.error('Error parsing JSON:', error);
        throw new Error("Error al procesar respuesta del servidor");
      });
      
      setEmpresas(prev => 
        prev.map(empresa => 
          empresa?.id === id ? updatedEmpresa : empresa
        )
      );
      return updatedEmpresa;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : err instanceof Event
        ? "Error de conexión de red"
        : "Error al actualizar empresa";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEmpresa = async (id: string) => {
    try {
      let response;
      try {
        response = await fetch(`/api/companies/${id}`, {
          method: "DELETE",
        });
      } catch (networkError) {
        const errorMessage = networkError instanceof Error 
          ? networkError.message 
          : networkError instanceof Event
          ? "Error de conexión de red"
          : "Error desconocido al conectar con el servidor";
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al eliminar empresa: ${response.status}`);
      }

      setEmpresas(prev => prev.filter(empresa => empresa?.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : err instanceof Event
        ? "Error de conexión de red"
        : "Error al eliminar empresa";
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

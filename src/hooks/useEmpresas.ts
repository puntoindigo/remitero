"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

export interface Empresa {
  id: string;
  name: string;
  createdAt: Date;
  users?: { id: string }[];
}

export function useEmpresas() {
  const { data: session, status } = useSession();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Verificar que la sesión esté disponible y completamente cargada
  if (status === 'loading' || !session) {
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
    // Evitar requests duplicados
    if (isLoadingRef.current) {
      return;
    }
    
    // Solo SUPERADMIN puede cargar todas las empresas
    if (session?.user?.role !== 'SUPERADMIN') {
      setEmpresas([]);
      setIsLoading(false);
      hasLoadedRef.current = true;
      return;
    }
    
    isLoadingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      try {
        response = await fetch("/api/companies", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
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
      hasLoadedRef.current = true;
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
      isLoadingRef.current = false;
    }
  }, [session?.user?.role]);

  const createEmpresa = async (name: string) => {
    try {
      let response;
      try {
        response = await fetch("/api/companies", {
          method: "POST",
          credentials: 'include',
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
          credentials: 'include',
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
          credentials: 'include',
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
    // Esperar a que la sesión esté completamente cargada
    if (status === 'loading') {
      return;
    }
    
    if (!session) {
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }
    
    // Solo cargar una vez si ya se cargó y el rol no cambió
    if (hasLoadedRef.current && empresas.length > 0 && session.user?.role === "SUPERADMIN") {
      return;
    }
    
    if (session.user?.role === "SUPERADMIN") {
      loadEmpresas();
    } else if (session.user) {
      setIsLoading(false);
      hasLoadedRef.current = true;
    }
  }, [session?.user?.role, status]); // Removido loadEmpresas de dependencias para evitar loops

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

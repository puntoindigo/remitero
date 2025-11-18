"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  phone?: string;
  address?: string;
  companyId?: string;
  company?: { id: string; name: string };
  createdAt: Date;
}

export interface UsuarioFormData {
  name: string;
  email: string;
  password?: string;
  role: "SUPERADMIN" | "ADMIN" | "USER";
  phone?: string;
  address?: string;
  companyId?: string;
}

export function useUsuarios(companyId?: string) {
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const usersUrl = companyId ? `/api/users?companyId=${companyId}` : '/api/users';
      
      const response = await fetch(usersUrl).catch(error => {
        console.error('Network error:', error);
        throw new Error("Error de conexión de red");
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || "Error al cargar usuarios");
      }
      
      const data = await response.json();
      setUsuarios(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading usuarios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createUsuario = async (userData: UsuarioFormData) => {
    try {
      // Agregar companyId si no está presente y el usuario es ADMIN
      const userDataWithCompany = {
        ...userData,
        companyId: userData.companyId || (session?.user?.role === 'ADMIN' ? session?.user?.companyId : undefined)
      };
      
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDataWithCompany)
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error("Error de conexión de red");
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear usuario");
      }

      const newUsuario = await response.json();
      setUsuarios(prev => [...prev, newUsuario]);
      return newUsuario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear usuario";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUsuario = async (id: string, userData: UsuarioFormData) => {
    try {
      // Agregar companyId si no está presente y el usuario es ADMIN
      const userDataWithCompany = {
        ...userData,
        companyId: userData.companyId || (session?.user?.role === 'ADMIN' ? session?.user?.companyId : undefined)
      };
      
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDataWithCompany)
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error("Error de conexión de red");
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar usuario");
      }

      const updatedUsuario = await response.json();
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario?.id === id ? updatedUsuario : usuario
        )
      );
      return updatedUsuario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar usuario";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error("Error de conexión con usuarios");
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar usuario");
      }

      setUsuarios(prev => prev.filter(usuario => usuario?.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar usuario";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    // Solo cargar usuarios si el usuario tiene permisos (ADMIN o SUPERADMIN)
    // Esto previene llamadas innecesarias a /api/users cuando el usuario no tiene permisos
    const userRole = session?.user?.role;
    const hasPermission = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
    const sessionReady = session !== null && userRole !== undefined;
    
    if (sessionReady && hasPermission) {
      loadUsuarios();
    } else {
      // Si no tiene permisos, establecer estado vacío y no cargar
      setUsuarios([]);
      setIsLoading(false);
      if (!sessionReady) {
        setError(null); // Esperando sesión
      } else {
        setError(null); // No tiene permisos, pero no es un error
      }
    }
  }, [session?.user?.role, companyId, session]);

  return {
    usuarios,
    isLoading,
    error,
    loadUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  };
}

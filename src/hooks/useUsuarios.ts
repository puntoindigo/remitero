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
      const response = await fetch(usersUrl);
      
      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
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
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar usuario");
      }

      const updatedUsuario = await response.json();
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === id ? updatedUsuario : usuario
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar usuario");
      }

      setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar usuario";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [session?.user?.role, companyId]);

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

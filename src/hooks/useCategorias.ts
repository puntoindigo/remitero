"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "./useCurrentUser";

export interface Categoria {
  id: string;
  name: string;
  description?: string;
  products: { id: string }[];
  createdAt: Date;
}

export interface CategoriaFormData {
  name: string;
  description?: string;
}

export function useCategorias(companyId?: string) {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategorias = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/categories?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar categorías");
      }
      
      const data = await response.json();
      setCategorias(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error loading categorias:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCategoria = async (data: CategoriaFormData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          description: data.description,
          companyId: currentUser?.companyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear categoría");
      }

      const newCategoria = await response.json();
      setCategorias(prev => [...prev, newCategoria]);
      return newCategoria;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear categoría";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCategoria = async (id: string, data: CategoriaFormData) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          description: data.description,
          companyId: currentUser?.companyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar categoría");
      }

      const updatedCategoria = await response.json();
      setCategorias(prev => 
        prev.map(categoria => 
          categoria.id === id ? updatedCategoria : categoria
        )
      );
      return updatedCategoria;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar categoría";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar categoría");
      }

      setCategorias(prev => prev.filter(categoria => categoria.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar categoría";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, [companyId]);

  return {
    categorias,
    isLoading,
    error,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
}

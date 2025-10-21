"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCurrentUserSimple } from "./useCurrentUserSimple";

export interface Categoria {
  id: string;
  name: string;
  products: { id: string }[];
  createdAt: Date;
}

export interface CategoriaFormData {
  name: string;
  description?: string;
}

export function useCategorias(companyId?: string) {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  const loadCategorias = useCallback(async () => {
    const effectiveCompanyId = getEffectiveCompanyId();
    
    if (!effectiveCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/categories?companyId=${effectiveCompanyId}`);
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
  }, [companyId, currentUser?.id, currentUser?.role, currentUser?.companyId, currentUser?.impersonating]);

  const createCategoria = async (data: CategoriaFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede crear la categoría: CompanyId no disponible");
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          companyId: effectiveCompanyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear categoría");
      }

      const newCategoria = await response.json();
      setCategorias(prev => [newCategoria, ...prev]);
      return newCategoria;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear categoría";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCategoria = async (id: string, data: CategoriaFormData) => {
    try {
      const effectiveCompanyId = getEffectiveCompanyId();
      
      if (!effectiveCompanyId) {
        throw new Error("No se puede actualizar la categoría: CompanyId no disponible");
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name,
          companyId: effectiveCompanyId
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
  }, [loadCategorias]);

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
